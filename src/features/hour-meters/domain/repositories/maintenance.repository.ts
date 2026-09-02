import { MaintenancePlan, MaintenanceThresholdConfiguration } from "../entities";

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
  getThresholds?(companyId: string, functionalPrincipleId: string): Promise<MaintenanceThresholdConfiguration[]>;
  saveThresholds?(companyId: string, functionalPrincipleId: string, thresholds: number[]): Promise<MaintenanceThresholdConfiguration[]>;
  deleteThreshold?(id: string): Promise<void>;
}
