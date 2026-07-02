import { EquipmentKpi } from "../entities";

/**
 * Contrato que debe implementar cualquier repositorio de KPIs de activos.
 * Permite intercambiar MockKpiRepository por SupabaseKpiRepository sin
 * modificar la capa de Application ni de Presentation.
 */
export interface IEquipmentKpiRepository {
  /**
   * Obtiene los KPIs calculados para un activo dado.
   * @param assetId Identificador único del activo.
   * @returns Promesa con los KPIs calculados, o null si no hay datos.
   */
  getKpiByAssetId(assetId: string): Promise<EquipmentKpi | null>;
}
