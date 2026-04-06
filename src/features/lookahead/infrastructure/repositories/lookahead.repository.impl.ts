/**
 * @fileoverview Implementación concreta del repositorio Look-a-Head.
 * Incluye lógica de cascada para desplazamiento de fechas dependientes.
 */

import {
  Task,
  Rig,
  CreateTaskPayload,
  UpdateTaskPayload,
} from "../../domain/entities";
import { ILookaheadRepository } from "../../domain/repositories/lookahead.repository";
import { LookaheadDataSource } from "../datasources/lookahead.datasource";

export class LookaheadRepositoryImpl implements ILookaheadRepository {
  constructor(private dataSource: LookaheadDataSource) {}

  async getRigs(): Promise<Rig[]> {
    const { data, error } = await this.dataSource.getRigs();
    if (error) throw new Error(error.message);
    return (data || []) as Rig[];
  }

  async getTasks(rigId: string): Promise<Task[]> {
    const { data, error } = await this.dataSource.getTasks(rigId);
    if (error) throw new Error(error.message);
    return (data || []) as Task[];
  }

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const { data, error } = await this.dataSource.createTask(payload);
    if (error) throw new Error(error.message);
    return data as Task;
  }

  async updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const { data, error } = await this.dataSource.updateTask(id, payload);
    if (error) throw new Error(error.message);
    return data as Task;
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await this.dataSource.deleteTask(id);
    if (error) throw new Error(error.message);
  }

  /**
   * Actualiza el vínculo de dependencia entre dos tareas.
   * Para "end-to-start": sourceId.next_task_id = targetId y targetId.previous_task_id = sourceId.
   */
  async updateDependency(sourceId: string, targetId: string | null): Promise<void> {
    const { error } = await this.dataSource.updateDependency(sourceId, targetId);
    if (error) throw new Error(error.message);
  }

  /**
   * Cascada de fechas: cuando la tarea `movedId` se desplaza `shiftMs` milisegundos,
   * recorre la cadena next_task_id y ajusta todas las tareas dependientes.
   * @param tasks - Lista completa de tareas del rig actual (para resolver la cadena)
   * @param movedId - UUID de la tarea que se movió
   * @param shiftMs - Desplazamiento en milisegundos (positivo = adelante, negativo = atrás)
   */
  async cascadeTaskDates(
    tasks: Task[],
    movedId: string,
    shiftMs: number
  ): Promise<void> {
    if (shiftMs === 0) return;

    // Construir mapa para rápida búsqueda por id
    const taskMap = new Map<string, Task>(tasks.map((t) => [t.id, t]));

    // Recopilar toda la cadena descendente desde movedId
    const updates: { id: string; start_date: string; end_date: string }[] = [];
    let currentId: string | null | undefined = taskMap.get(movedId)?.next_task_id;

    while (currentId) {
      const t = taskMap.get(currentId);
      if (!t) break;

      const newStart = new Date(new Date(t.start_date).getTime() + shiftMs).toISOString();
      const newEnd   = new Date(new Date(t.end_date).getTime()   + shiftMs).toISOString();
      updates.push({ id: t.id, start_date: newStart, end_date: newEnd });

      currentId = t.next_task_id;
    }

    if (updates.length === 0) return;

    const { error } = await this.dataSource.updateTasksBatch(updates);
    if (error) throw new Error(error.message);
  }
}
