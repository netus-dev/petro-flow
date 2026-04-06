/**
 * @fileoverview Datasource de Supabase para el módulo Look-a-Head.
 * Responsabilidad única: comunicarse con Supabase.
 * No contiene lógica de negocio — eso corresponde a la capa Application.
 */

import { createClient } from "@/src/core/lib/supabase/client";
import { CreateTaskPayload, UpdateTaskPayload } from "../../domain/entities";

/**
 * Datasource que encapsula todas las llamadas a Supabase
 * para las tablas `tasks` y `locations` (rigs).
 */
export class LookaheadDataSource {
  private supabase = createClient();

  /**
   * Obtiene los rigs desde la tabla `locations` donde type = 'rig'.
   * Los rigs usan el mismo id que locations (FK rigs.id → locations.id).
   */
  async getRigs() {
    const { data, error } = await this.supabase
      .from("locations")
      .select("id, name")
      .eq("type", "rig")
      .eq("is_active", true)
      .order("name");

    return { data, error };
  }

  /**
   * Obtiene las tareas activas de un rig específico, ordenadas por fecha de inicio.
   * Aplica soft-delete filter: is_active = true.
   * @param rigId - UUID del rig
   */
  async getTasks(rigId: string) {
    const { data, error } = await this.supabase
      .from("tasks")
      .select("*")
      .eq("rig_id", rigId)
      .eq("is_active", true)
      .order("start_date", { ascending: true });

    return { data, error };
  }

  /**
   * Crea una nueva tarea. Obtiene el usuario autenticado actual
   * para asignarlo como `created_by`.
   * @param payload - Datos de la tarea sin created_by
   */
  async createTask(payload: CreateTaskPayload) {
    // Obtener el usuario autenticado actual para created_by
    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: authError || new Error("Usuario no autenticado") };
    }

    const { data, error } = await this.supabase
      .from("tasks")
      .insert({
        ...payload,
        created_by: user.id,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Actualiza campos específicos de una tarea existente (PATCH).
   * @param id - UUID de la tarea
   * @param payload - Campos a actualizar
   */
  async updateTask(id: string, payload: UpdateTaskPayload) {
    const { data, error } = await this.supabase
      .from("tasks")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Eliminación lógica: actualiza is_active a false.
   * El registro permanece en BD pero no se muestra en la UI.
   * @param id - UUID de la tarea a "eliminar"
   */
  async deleteTask(id: string) {
    const { error } = await this.supabase
      .from("tasks")
      .update({ is_active: false })
      .eq("id", id);

    return { error };
  }

  /**
   * Actualiza el vínculo de dependencia entre tareas.
   * Usado cuando se crea/elimina un link en el Gantt.
   * @param sourceId - UUID de la tarea origen
   * @param targetId - UUID de la tarea destino | null para limpiar
   */
  async updateDependency(sourceId: string, targetId: string | null) {
    const { error: e1 } = await this.supabase
      .from("tasks")
      .update({ next_task_id: targetId })
      .eq("id", sourceId);

    if (targetId) {
      const { error: e2 } = await this.supabase
        .from("tasks")
        .update({ previous_task_id: sourceId })
        .eq("id", targetId);
      return { error: e1 || e2 };
    }

    return { error: e1 };
  }

  /**
   * Actualiza múltiples tareas en paralelo (para cascada de fechas).
   * @param updates - Array de { id, start_date, end_date }
   */
  async updateTasksBatch(updates: { id: string; start_date: string; end_date: string }[]) {
    const promises = updates.map(({ id, start_date, end_date }) =>
      this.supabase
        .from("tasks")
        .update({ start_date, end_date })
        .eq("id", id)
    );
    const results = await Promise.all(promises);
    const error = results.find((r) => r.error)?.error;
    return { error };
  }
}
