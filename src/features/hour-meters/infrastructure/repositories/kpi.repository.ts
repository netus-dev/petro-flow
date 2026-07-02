import { IEquipmentKpiRepository } from "../../domain/repositories/kpi.repository";
import { EquipmentKpi } from "../../domain/entities";
import { MockKpiDatasource } from "../datasources/kpi.datasource";

/**
 * Implementación concreta del repositorio de KPIs de activos.
 * Delega la obtención de datos a un datasource de datos simulados (Mock).
 */
export class KpiRepositoryImpl implements IEquipmentKpiRepository {
  constructor(private datasource: MockKpiDatasource) {}

  /**
   * Obtiene los KPIs calculados de un activo dado llamando al datasource.
   * @param assetId Identificador único del activo.
   * @returns Promesa con los KPIs del activo, o null si no hay datos.
   */
  async getKpiByAssetId(assetId: string): Promise<EquipmentKpi | null> {
    return this.datasource.getKpiByAssetId(assetId);
  }
}
