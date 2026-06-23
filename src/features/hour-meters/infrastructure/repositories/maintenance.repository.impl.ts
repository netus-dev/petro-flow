import { IMaintenancePlanRepository } from "../../domain/repositories/maintenance.repository";
import { MaintenancePlan } from "../../domain/entities";
import { MockMaintenanceDatasource } from "../datasources/maintenance.datasource";

/**
 * Implementación concreta del repositorio de planes de mantenimiento.
 * Delega la obtención de datos a un datasource de datos simulados.
 */
export class MaintenancePlanRepositoryImpl implements IMaintenancePlanRepository {
  constructor(private datasource: MockMaintenanceDatasource) {}

  /**
   * Obtiene todos los planes de mantenimiento para un activo dado llamando al datasource.
   * @param equipmentId Identificador único del activo.
   * @returns Promesa que resuelve a la lista de planes de mantenimiento del activo.
   */
  async getPlansByEquipmentId(equipmentId: string): Promise<MaintenancePlan[]> {
    return this.datasource.getPlansByEquipmentId(equipmentId);
  }
}
