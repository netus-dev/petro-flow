import { createClient } from "@/src/core/lib/supabase/client";
import { calculateOperationalDeltas, DailyOperationsKpi, HourMeterRecord } from "../../domain/entities";
import { IHourMeterRepository, RegisterHourMeterInput } from "../../domain/repositories/hour-meter.repository";
import { toHourMeterRecord } from "../mappers/hour-meter.mapper";

export type HourMeterRow = {
  id: string; asset_id: string; equipment: string; platform: string;
  hours: number | null; unit: string;
  captured_at: string | null; max_threshold: number; last_maintenance_date: string | null;
  last_maintenance_reading: number | null; diesel_accumulated_gallons: number | null;
  mw_accumulated: number | null; mvar_accumulated: number | null;
};

export function mapRow(row: HourMeterRow): HourMeterRecord {
  return toHourMeterRecord({ id: row.id, assetId: row.asset_id, platform: row.platform, equipment: row.equipment,
    currentReading: row.hours, previousReading: null, unit: row.unit,
    lastUpdated: row.captured_at, maxThreshold: row.max_threshold,
    lastMaintenanceDate: row.last_maintenance_date ?? "", lastMaintenanceReading: row.last_maintenance_reading,
    dieselAccumulatedGallons: row.diesel_accumulated_gallons, dailyMwAccumulated: row.mw_accumulated,
    dailyMvarAccumulated: row.mvar_accumulated });
}

export const HOURMETER_ELIGIBLE_PRINCIPLES = ["Motor de Combustión Interna", "Bomba de Lodo", "Malacate", "Top Drive", "Bomba para Operar Preventores", "Unidad de Potencia Hidráulica"] as const;

export function isHourMeterEligiblePrinciple(name: string | null | undefined): boolean {
  return name != null && HOURMETER_ELIGIBLE_PRINCIPLES.includes(name as typeof HOURMETER_ELIGIBLE_PRINCIPLES[number]);
}

export function latestHistory(rows: readonly HourMeterRow[]): HourMeterRow | undefined {
  return [...rows].sort((a, b) => (b.captured_at ?? "").localeCompare(a.captured_at ?? ""))[0];
}

/** Supabase adapter. RLS derives company ownership from the authenticated user. */
export class SupabaseHourMeterRepository implements IHourMeterRepository {
  private readonly supabase = createClient();

  async getAll(): Promise<HourMeterRecord[]> {
    const { data, error } = await this.supabase.from("assets").select("id, code, name, current_location_id, functional_principles(name), asset_operational_parameters_history(*)").eq("is_active", true).order("code");
    if (error) throw error;
    return (data as unknown as Array<{ id: string; code: string; name: string; current_location_id: string | null; functional_principles: { name: string } | { name: string }[] | null; asset_operational_parameters_history: HourMeterRow[] }>).filter((asset) => isHourMeterEligiblePrinciple(Array.isArray(asset.functional_principles) ? asset.functional_principles[0]?.name : asset.functional_principles?.name)).map((asset) => {
      const row = latestHistory(asset.asset_operational_parameters_history ?? []);
      return mapRow(row ?? { id: asset.id, asset_id: asset.id, equipment: asset.name || asset.code, platform: "", hours: null, unit: "hrs", captured_at: null, max_threshold: 5000, last_maintenance_date: null, last_maintenance_reading: null, diesel_accumulated_gallons: null, mw_accumulated: null, mvar_accumulated: null });
    });
  }

  /** Returns deltas from the two latest consecutive readings for one asset. */
  async getLast24Hours(assetId: string): Promise<DailyOperationsKpi> {
    const { data, error } = await this.supabase
      .from("asset_operational_parameters_history")
      .select("diesel_accumulated_gallons, mw_accumulated, captured_at")
      .eq("asset_id", assetId)
      .order("captured_at", { ascending: false })
      .limit(2);
    if (error) throw error;
    const rows = (data ?? []) as Array<Pick<HourMeterRow, "diesel_accumulated_gallons" | "mw_accumulated" | "captured_at">>;
    const current = rows[0];
    const previous = rows[1];
    const deltas = calculateOperationalDeltas(
      previous ? { dieselAccumulatedGallons: previous.diesel_accumulated_gallons, dailyMwAccumulated: previous.mw_accumulated } : null,
      { dieselAccumulatedGallons: current?.diesel_accumulated_gallons ?? null, dailyMwAccumulated: current?.mw_accumulated ?? null }
    );
    return { ...deltas, lastUpdated: current?.captured_at ?? new Date().toISOString() };
  }

  async register(input: RegisterHourMeterInput): Promise<HourMeterRecord> {
    const { data, error } = await this.supabase.from("asset_operational_parameters_history").insert({
      asset_id: input.assetId, hours: input.currentReading, captured_at: input.capturedAt,
      diesel_accumulated_gallons: input.dieselAccumulatedGallons, mw_accumulated: input.dailyMwAccumulated,
      mvar_accumulated: input.dailyMvarAccumulated,
    }).select("*, assets!inner(name, code)").single();
    if (error) throw error;
    return mapRow(data as HourMeterRow);
  }
}
