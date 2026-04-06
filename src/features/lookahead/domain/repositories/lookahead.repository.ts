/**
 * @fileoverview Interface del repositorio del módulo Look-a-Head.
 */

import {
  Task,
  Rig,
  CreateTaskPayload,
  UpdateTaskPayload,
} from "../entities";

export interface ILookaheadRepository {
  getRigs(): Promise<Rig[]>;
  getTasks(rigId: string): Promise<Task[]>;
  createTask(payload: CreateTaskPayload): Promise<Task>;
  updateTask(id: string, payload: UpdateTaskPayload): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  /** Vincula/desvincula la dependencia next→previous entre dos tareas */
  updateDependency(sourceId: string, targetId: string | null): Promise<void>;
  /** Propaga el desplazamiento de fechas a la cadena de tareas dependientes */
  cascadeTaskDates(tasks: Task[], movedId: string, shiftMs: number): Promise<void>;
}
