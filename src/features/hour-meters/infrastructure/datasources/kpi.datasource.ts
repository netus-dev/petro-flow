import type { SupabaseClient } from "@supabase/supabase-js";
import { EquipmentKpi, ReliabilityPeriod } from "../../domain/entities";

export interface KpiDatasource {
  getKpiByAssetId(assetId: string): Promise<EquipmentKpi | null>;
}

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
export class MockKpiDatasource implements KpiDatasource {
  private static readonly mockBaseData: Record<string, MockKpiBase> = {
    "ODO-001": { mtbf: null, mttr: null, failureHoursMonth: 0, totalHoursMonth: 0 },
    "ODO-002": { mtbf: null, mttr: null, failureHoursMonth: 0, totalHoursMonth: 0 },
    "ODO-003": { mtbf: null, mttr: null, failureHoursMonth: 0, totalHoursMonth: 0 },
    "ODO-004": { mtbf: null, mttr: null, failureHoursMonth: 0, totalHoursMonth: 0 },
    "ODO-005": { mtbf: null, mttr: null, failureHoursMonth: 0, totalHoursMonth: 0 },
    "ODO-006": { mtbf: null, mttr: null, failureHoursMonth: 0, totalHoursMonth: 0 }, // Caso N/A
    "ODO-007": { mtbf: null, mttr: null, failureHoursMonth: 0, totalHoursMonth: 0 },
    "ODO-008": { mtbf: null, mttr: null, failureHoursMonth: 0, totalHoursMonth: 0 },
    "ODO-009": { mtbf: null, mttr: null, failureHoursMonth: 0, totalHoursMonth: 0 },
    "ODO-010": { mtbf: null, mttr: null, failureHoursMonth: 0, totalHoursMonth: 0 },
    "ODO-011": { mtbf: null, mttr: null, failureHoursMonth: 0, totalHoursMonth: 0 },
    "ODO-012": { mtbf: null, mttr: null, failureHoursMonth: 0, totalHoursMonth: 0 },
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
      : null;

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

/** Reads KPI source data from the tenant-scoped Supabase client. */
export class SupabaseKpiDatasource implements KpiDatasource {
  constructor(private readonly supabase: SupabaseClient) {}

  async getKpiByAssetId(assetId: string): Promise<EquipmentKpi | null> {
    const { data, error } = await this.supabase
      .from("asset_operational_parameters_history")
      .select("asset_id")
      .eq("asset_id", assetId)
      .limit(1);
    if (error) throw error;
    if (!data?.length) return null;

    // Failure-source tables are not available in this schema. Never fabricate KPI values.
    return {
      assetId,
      mtbf: null,
      mttr: null,
      availability: null,
      reliability: { "1w": null, "1m": null, "3m": null },
    };
  }
}
