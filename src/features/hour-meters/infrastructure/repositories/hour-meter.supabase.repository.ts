import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateOperationalDeltas, DailyOperationsKpi, HourMeterRecord, MaintenanceThresholdConfiguration } from "../../domain/entities";
import { IHourMeterRepository, RegisterHourMeterInput } from "../../domain/repositories/hour-meter.repository";
import { toHourMeterRecord } from "../mappers/hour-meter.mapper";

export type HourMeterRow = {
  id: string; asset_id: string; equipment: string; platform: string;
  hours: number | null; unit: string;
  captured_at: string | null; max_threshold: number; last_maintenance_date: string | null;
  last_maintenance_reading: number | null; diesel_accumulated_gallons: number | null;
  mw_accumulated: number | null; mvar_accumulated: number | null;
};

type NameRelation = { name: string } | { name: string }[] | null;
type HourMeterAssetRow = {
  id: string;
  company_id: string;
  function_principle_id: string;
  current_location_id: string;
  current_ubication_id: string | null;
  functional_principles: NameRelation;
  locations: NameRelation;
  ubications: NameRelation;
  asset_operational_parameters_history: HourMeterRow[];
};

/** Normalizes a PostgREST to-one relation regardless of inferred array shape. */
function relationName(relation: NameRelation): string {
  return (Array.isArray(relation) ? relation[0]?.name : relation?.name) ?? "";
}

/** Maps one asset and its latest persisted reading into the domain model. */
function mapAsset(asset: Omit<HourMeterAssetRow, "asset_operational_parameters_history">, row?: HourMeterRow): HourMeterRecord {
  return { ...mapRow(row ?? {
    id: asset.id,
    asset_id: asset.id,
    hours: null,
    captured_at: null,
    diesel_accumulated_gallons: null,
    mw_accumulated: null,
    mvar_accumulated: null,
  } as HourMeterRow, {
     equipment: relationName(asset.ubications) || relationName(asset.functional_principles),
    platform: relationName(asset.locations),
  }), rigId: asset.current_location_id, rigName: relationName(asset.locations), companyId: asset.company_id, functionalPrincipleId: asset.function_principle_id };
}

/** Maps a persisted history row and optional asset labels into the domain model. */
export function mapRow(row: HourMeterRow, asset?: { equipment: string; platform: string }): HourMeterRecord {
  return toHourMeterRecord({ id: row.id, assetId: row.asset_id, platform: asset?.platform ?? row.platform ?? "", equipment: asset?.equipment ?? row.equipment ?? row.asset_id,
    currentReading: row.hours, previousReading: null, unit: row.unit ?? "hrs",
    lastUpdated: row.captured_at, maxThreshold: row.max_threshold ?? 5000,
    lastMaintenanceDate: row.last_maintenance_date ?? null, lastMaintenanceReading: row.last_maintenance_reading ?? null,
    dieselAccumulatedGallons: row.diesel_accumulated_gallons ?? null, dailyMwAccumulated: row.mw_accumulated ?? null,
    dailyMvarAccumulated: row.mvar_accumulated ?? null });
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
  constructor(private readonly supabase: SupabaseClient) {}

  async getAll(rigId?: string): Promise<HourMeterRecord[]> {
    let query = this.supabase.from("assets").select("id, company_id, function_principle_id, current_location_id, current_ubication_id, functional_principles!assets_function_principle_id_fkey(name), locations!assets_current_location_id_fkey(name), ubications!assets_company_id_current_ubication_id_fkey(name), asset_operational_parameters_history!asset_operational_parameters_history_asset_id_fkey(*)").eq("is_active", true);
    if (rigId) query = query.eq("current_location_id", rigId);
    const { data, error } = await query.order("id");
    if (error) throw error;
    return (data as unknown as HourMeterAssetRow[]).filter((asset) => isHourMeterEligiblePrinciple(relationName(asset.functional_principles))).map((asset) => {
      const row = latestHistory(asset.asset_operational_parameters_history ?? []);
      const record = mapAsset(asset, row);
      return { ...record, rigId: asset.current_location_id, rigName: relationName(asset.locations), companyId: asset.company_id, functionalPrincipleId: asset.function_principle_id };
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
    const { data: companyId, error: companyError } = await this.supabase.rpc("rbac_request_company_id");
    if (companyError || !companyId) throw companyError ?? new Error("Tenant context is unavailable");
    const { data, error } = await this.supabase.from("asset_operational_parameters_history").insert({
      company_id: companyId, asset_id: input.assetId, hours: input.currentReading, captured_at: input.capturedAt,
      diesel_accumulated_gallons: input.dieselAccumulatedGallons, mw_accumulated: input.dailyMwAccumulated,
      mvar_accumulated: input.dailyMvarAccumulated,
    }).select("*, assets!asset_operational_parameters_history_asset_id_fkey(functional_principles!assets_function_principle_id_fkey(name), locations!assets_current_location_id_fkey(name), ubications!assets_company_id_current_ubication_id_fkey(name))").single();
    if (error) throw error;
    const inserted = data as unknown as HourMeterRow & { assets: Pick<HourMeterAssetRow, "functional_principles" | "locations" | "ubications"> };
    return mapAsset({ id: inserted.asset_id, company_id: "", function_principle_id: "", current_location_id: "", current_ubication_id: null, ...inserted.assets }, inserted);
  }

  async getThresholds(companyId: string, functionalPrincipleId: string): Promise<MaintenanceThresholdConfiguration[]> {
    const { data, error } = await this.supabase.from("hourmeter_maintenance_thresholds").select("id, company_id, functional_principle_id, threshold_hours").eq("company_id", companyId).eq("functional_principle_id", functionalPrincipleId).order("threshold_hours");
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, companyId: row.company_id, functionalPrincipleId: row.functional_principle_id, thresholdHours: row.threshold_hours }));
  }

  async saveThresholds(companyId: string, functionalPrincipleId: string, thresholds: number[]): Promise<MaintenanceThresholdConfiguration[]> {
    const { error: deleteError } = await this.supabase.from("hourmeter_maintenance_thresholds").delete().eq("company_id", companyId).eq("functional_principle_id", functionalPrincipleId);
    if (deleteError) throw deleteError;
    if (!thresholds.length) return [];
    const { data, error } = await this.supabase.from("hourmeter_maintenance_thresholds").insert(thresholds.map((threshold_hours) => ({ company_id: companyId, functional_principle_id: functionalPrincipleId, threshold_hours }))).select("id, company_id, functional_principle_id, threshold_hours");
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, companyId: row.company_id, functionalPrincipleId: row.functional_principle_id, thresholdHours: row.threshold_hours }));
  }

  async deleteThreshold(id: string): Promise<void> { const { error } = await this.supabase.from("hourmeter_maintenance_thresholds").delete().eq("id", id); if (error) throw error; }
}
