import { EquipmentKpi, ReliabilityPeriod } from "../../domain/entities";

/**
 * Interface interna para definir los parámetros base del cálculo de KPIs mock.
 */
interface MockKpiBase {
  mtbf: number | null;
  mttr: number | null;
  failureHoursMonth: number;
  totalHoursMonth: number;
}

/**
 * Datasource de pruebas para simular KPIs operacionales por activo.
 * Proporciona datos de MTBF, MTTR, Disponibilidad y Confiabilidad.
 * 
 * TODO: Replace with SupabaseKpiDatasource before production.
 */
export class MockKpiDatasource {
  private static readonly mockBaseData: Record<string, MockKpiBase> = {
    "ODO-001": { mtbf: 420, mttr: 3.5, failureHoursMonth: 7, totalHoursMonth: 720 },
    "ODO-002": { mtbf: 600, mttr: 2.0, failureHoursMonth: 4, totalHoursMonth: 720 },
    "ODO-003": { mtbf: 150, mttr: 8.5, failureHoursMonth: 24, totalHoursMonth: 720 },
    "ODO-004": { mtbf: 800, mttr: 1.5, failureHoursMonth: 2, totalHoursMonth: 720 },
    "ODO-005": { mtbf: 500, mttr: 4.0, failureHoursMonth: 8, totalHoursMonth: 720 },
    "ODO-006": { mtbf: null, mttr: null, failureHoursMonth: 0, totalHoursMonth: 720 }, // Caso N/A
    "ODO-007": { mtbf: 350, mttr: 5.0, failureHoursMonth: 10, totalHoursMonth: 720 },
    "ODO-008": { mtbf: 900, mttr: 3.0, failureHoursMonth: 3, totalHoursMonth: 720 },
    "ODO-009": { mtbf: 250, mttr: 6.0, failureHoursMonth: 18, totalHoursMonth: 720 },
    "ODO-010": { mtbf: 700, mttr: 2.5, failureHoursMonth: 5, totalHoursMonth: 720 },
    "ODO-011": { mtbf: 480, mttr: 4.5, failureHoursMonth: 9, totalHoursMonth: 720 },
    "ODO-012": { mtbf: 300, mttr: 7.0, failureHoursMonth: 14, totalHoursMonth: 720 },
  };

  /**
   * Obtiene de forma asíncrona los KPIs calculados de un activo.
   * @param assetId Identificador único del activo.
   * @returns Promesa con los KPIs calculados, o null si no se encuentra.
   */
  async getKpiByAssetId(assetId: string): Promise<EquipmentKpi | null> {
    // Simular latencia de red de 150ms
    await new Promise((resolve) => setTimeout(resolve, 150));

    const base = MockKpiDatasource.mockBaseData[assetId];
    if (!base) {
      return null;
    }

    const availability = base.totalHoursMonth > 0
      ? Number((100 * (1 - base.failureHoursMonth / base.totalHoursMonth)).toFixed(2))
      : 100;

    const reliability: Record<ReliabilityPeriod, number | null> = {
      "1w": null,
      "1m": null,
      "3m": null,
    };

    if (base.mtbf !== null && base.mtbf > 0) {
      reliability["1w"] = Number((Math.exp(-168 / base.mtbf) * 100).toFixed(2));
      reliability["1m"] = Number((Math.exp(-720 / base.mtbf) * 100).toFixed(2));
      reliability["3m"] = Number((Math.exp(-2160 / base.mtbf) * 100).toFixed(2));
    }

    return {
      assetId,
      mtbf: base.mtbf,
      mttr: base.mttr,
      availability,
      reliability,
    };
  }
}
