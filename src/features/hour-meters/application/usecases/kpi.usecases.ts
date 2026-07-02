import { Either, left, right } from "../../../../core/utils/either";
import { EquipmentKpi } from "../../domain/entities";
import { IEquipmentKpiRepository } from "../../domain/repositories/kpi.repository";

/**
 * Representa una interfaz base para fallas de lógica de negocio o infraestructura.
 */
export interface Failure {
  /** Mensaje descriptivo de la falla. */
  message: string;
}

/**
 * Falla específica cuando ocurre un error en la capa de datos/repositorio de KPIs.
 */
export class RepositoryFailure implements Failure {
  constructor(public readonly message: string) {}
}

/**
 * Caso de uso para obtener los KPIs operacionales de un activo.
 * Retorna un objeto Either conteniendo la falla o el KPI calculado.
 */
export class GetEquipmentKpiUseCase {
  constructor(private repository: IEquipmentKpiRepository) {}

  /**
   * Ejecuta la lógica de negocio para obtener los KPIs del activo.
   * @param assetId Identificador único del activo.
   * @returns Promesa que resuelve a un Either conteniendo la falla o los KPIs del activo (o null).
   */
  async execute(assetId: string): Promise<Either<Failure, EquipmentKpi | null>> {
    try {
      const kpi = await this.repository.getKpiByAssetId(assetId);
      return right(kpi);
    } catch (error: any) {
      return left(
        new RepositoryFailure(
          error?.message || "Error desconocido al obtener KPIs del activo."
        )
      );
    }
  }
}
