/**
 * @fileoverview Use Cases del módulo Look-a-Head.
 * Cada clase representa un caso de uso único y recibe el repositorio
 * por inyección de dependencias (Dependency Injection).
 * Siguen el mismo patrón del resto del sistema (auth, requisitions, etc.)
 */

import {
  Task,
  Rig,
  CreateTaskPayload,
  UpdateTaskPayload,
} from "../../domain/entities";
import { ILookaheadRepository } from "../../domain/repositories/lookahead.repository";

/**
 * Obtiene la lista de rigs disponibles para el dropdown de filtro.
 * Consulta locations con type='rig' y is_active=true.
 */
export class GetRigsUseCase {
  constructor(private repository: ILookaheadRepository) {}

  /** @returns Lista de rigs activos */
  execute(): Promise<Rig[]> {
    return this.repository.getRigs();
  }
}

/**
 * Obtiene las tareas activas (is_active=true) de un rig dado.
 * Las tareas se devuelven ordenadas por fecha de inicio.
 */
export class GetTasksUseCase {
  constructor(private repository: ILookaheadRepository) {}

  /**
   * @param rigId - UUID del rig del cual obtener tareas
   * @returns Lista de tareas activas del rig
   */
  execute(rigId: string): Promise<Task[]> {
    return this.repository.getTasks(rigId);
  }
}

/**
 * Crea una nueva tarea para un rig.
 * El `created_by` es resuelto internamente por la infraestructura.
 * Valida que los campos mínimos estén presentes.
 */
export class CreateTaskUseCase {
  constructor(private repository: ILookaheadRepository) {}

  /**
   * @param payload - Datos de la nueva tarea (sin created_by)
   * @throws Error si faltan campos obligatorios
   */
  async execute(payload: CreateTaskPayload): Promise<Task> {
    if (!payload.description?.trim()) {
      throw new Error("La descripción de la tarea es obligatoria");
    }
    if (!payload.start_date || !payload.end_date) {
      throw new Error("Las fechas de inicio y fin son obligatorias");
    }
    if (!payload.rig_id) {
      throw new Error("Debe seleccionar un rig para la tarea");
    }
    return this.repository.createTask(payload);
  }
}

/**
 * Actualiza campos de una tarea existente (semántica PATCH).
 * Permite actualización parcial de cualquier campo editable.
 */
export class UpdateTaskUseCase {
  constructor(private repository: ILookaheadRepository) {}

  /**
   * @param id - UUID de la tarea a actualizar
   * @param payload - Campos a actualizar (todos opcionales)
   */
  execute(id: string, payload: UpdateTaskPayload): Promise<Task> {
    return this.repository.updateTask(id, payload);
  }
}

/**
 * Eliminación lógica de una tarea (soft delete).
 * Establece is_active=false en lugar de borrar el registro.
 */
export class DeleteTaskUseCase {
  constructor(private repository: ILookaheadRepository) {}

  /**
   * @param id - UUID de la tarea a eliminar lógicamente
   */
  execute(id: string): Promise<void> {
    return this.repository.deleteTask(id);
  }
}
