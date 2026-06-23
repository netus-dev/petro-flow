import { MaintenancePlan } from "../entities";

/**
 * Interface para el repositorio de planes de mantenimiento.
 * Define los contratos para la obtención de datos de planes y actividades de mantenimiento.
 */
export interface IMaintenancePlanRepository {
  /**
   * Obtiene todos los planes de mantenimiento asociados a un activo específico.
   * @param equipmentId Identificador único del activo (HourMeterRecord.id).
   * @returns Promesa que resuelve a una lista de planes de mantenimiento.
   */
  getPlansByEquipmentId(equipmentId: string): Promise<MaintenancePlan[]>;
}
