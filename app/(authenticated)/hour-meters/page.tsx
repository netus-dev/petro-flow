import { HourMeterContent } from "@/src/features/hour-meters/presentation/components/hour-meters-content";
import { createTenantClient } from "@/src/core/lib/supabase/server";
import { HourMeterRecord } from "@/src/features/hour-meters/domain/entities";
import { HOUR_METER_PERMISSIONS } from "@/src/features/hour-meters/domain/permissions";
import { readHourMeters } from "@/src/features/hour-meters/infrastructure/server/hour-meter-actions";

export default async function HourMetersPage() {
  const supabase = await createTenantClient();
  if (!supabase) return <HourMeterContent initialRecords={[]} permissions={[]} />;
  const [{ data: company }, scopeResponse] = await Promise.all([supabase.rpc("rbac_request_company_id"), supabase.rpc("rbac_user_rig_scope")]);
  const scope = scopeResponse?.data;
  const authorizationResponse = company
    ? await supabase.rpc("authorization_projection", { p_company_id: company })
    : null;
  const authorization = authorizationResponse?.data;
  const capabilities = (authorization?.capabilities ?? []) as Array<{ action: string; resource: string }>;
  const codes = capabilities.flatMap(({ action, resource }) => {
    if (resource !== "hour-meters") return [];
    if (action === "read") return [HOUR_METER_PERMISSIONS.access];
    if (action === "register") return [HOUR_METER_PERMISSIONS.register];
    return [];
  });
  const rigs = (scope?.rigs ?? []) as Array<{ id: string; name: string }>;
  const hourMeters = rigs[0] ? await readHourMeters(rigs[0].id) : { ok: false as const, error: "No active Rig is authorized." };
  const initialRecords: HourMeterRecord[] = hourMeters.ok ? hourMeters.data : [];
  return <HourMeterContent initialRecords={initialRecords} permissions={codes} rigs={rigs} initialRigId={rigs[0]?.id} />;
}
