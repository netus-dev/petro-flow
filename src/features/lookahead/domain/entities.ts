/**
 * @fileoverview Entidades de dominio para el módulo Look-a-Head (planificación de tareas).
 * Los valores de TaskStatus coinciden exactamente con el enum task_status de Supabase.
 */

/** Estado de una tarea — coincide con el enum `task_status` de la BD */
export type TaskStatus = "pending" | "completed" | "in_progress";

/**
 * Entidad Task que representa una tarea de operación en una plataforma petrolera.
 * Mapea directamente la tabla `public.tasks` de Supabase.
 */
export interface Task {
  id: string;
  description: string;
  start_date: string; // ISO string (timestamp with time zone)
  end_date: string;   // ISO string (timestamp with time zone)
  comments?: string | null;
  previous_task_id?: string | null;
  next_task_id?: string | null;
  created_by: string; // UUID → referencia a users.id
  rig_id: string;     // UUID → referencia a rigs.id
  created_at: string;
  updated_at: string;
  is_active: boolean;
  status: TaskStatus;
  /** Campo enriquecido en el cliente (nombre del rig desde locations.name) */
  rig_name?: string;
}

/**
 * Entidad Rig — cargada desde `locations` WHERE type = 'rig'.
 * La tabla `rigs` usa el mismo `id` que `locations`, por lo que el nombre
 * viene de la tabla `locations`.
 */
export interface Rig {
  id: string;
  name: string;
}

/** Estadísticas resumen de tareas del rig seleccionado */
export interface LookaheadStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

/**
 * Payload para crear una nueva tarea.
 * `created_by` es asignado automáticamente en la capa de infraestructura
 * a partir del usuario autenticado actual.
 */
export interface CreateTaskPayload {
  description: string;
  start_date: string;
  end_date: string;
  rig_id: string;
  status: TaskStatus;
  comments?: string;
  previous_task_id?: string | null;
  next_task_id?: string | null;
}

/**
 * Payload para actualizar una tarea existente.
 * Todos los campos son opcionales (PATCH semántico).
 */
export interface UpdateTaskPayload {
  description?: string;
  start_date?: string;
  end_date?: string;
  comments?: string | null;
  status?: TaskStatus;
  previous_task_id?: string | null;
  next_task_id?: string | null;
}
