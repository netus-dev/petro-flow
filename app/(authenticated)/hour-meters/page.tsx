import { HourMeterContent } from "@/src/features/hour-meters/presentation/components/hour-meters-content";
import { createClient } from "@/src/core/lib/supabase/server";
import { HourMeterRecord } from "@/src/features/hour-meters/domain/entities";
import { HourMeterRow } from "@/src/features/hour-meters/infrastructure/repositories/hour-meter.supabase.repository";
import { toHourMeterRecord } from "@/src/features/hour-meters/infrastructure/mappers/hour-meter.mapper";
import { HOUR_METER_PERMISSIONS } from "@/src/features/hour-meters/domain/permissions";

export default async function HourMetersPage() {
  const supabase = await createClient();
  const [{ data: rows }, { data: settings }, { data: company }] = await Promise.all([
    supabase.from("assets").select("id, code, name, functional_principles(name), asset_operational_parameters_history(*)").eq("is_active", true),
    supabase.from("hourmeters_settings").select("eligible_functional_principles").maybeSingle(),
    supabase.rpc("rbac_request_company_id"),
  ]);
  const { data: authorization } = company
    ? await supabase.rpc("authorization_projection", { p_company_id: company })
    : { data: null };
  const capabilities = (authorization?.capabilities ?? []) as Array<{ action: string; resource: string }>;
  const codes = capabilities.flatMap(({ action, resource }) => {
    if (resource !== "hourmeters") return [];
    if (action === "read") return [HOUR_METER_PERMISSIONS.access];
    if (action === "register") return [HOUR_METER_PERMISSIONS.register];
    return [];
  });
  const eligible = settings?.eligible_functional_principles ?? [];
  const initialRecords: HourMeterRecord[] = (rows as any[] | null ?? []).filter((asset) => eligible.includes(asset.functional_principles?.name ?? asset.functional_principles?.[0]?.name)).map((asset) => { const row = asset.asset_operational_parameters_history?.sort((a: any, b: any) => b.captured_at.localeCompare(a.captured_at))[0]; return toHourMeterRecord({ id: row?.id ?? asset.id, assetId: asset.id, platform: "", equipment: asset.name || asset.code, currentReading: row?.hours ?? null, previousReading: null, unit: "hrs", lastUpdated: row?.captured_at ?? null, maxThreshold: 5000, lastMaintenanceDate: null, lastMaintenanceReading: null, dieselAccumulatedGallons: row?.diesel_accumulated_gallons ?? null, dailyMwAccumulated: row?.mw_accumulated ?? null, dailyMvarAccumulated: row?.mvar_accumulated ?? null }); });
  return <HourMeterContent initialRecords={initialRecords} permissions={codes} />;
}
