import { HourMeterContent } from "@/src/features/hour-meters/presentation/components/hour-meters-content";
import { createTenantClient } from "@/src/core/lib/supabase/server";
import { HourMeterRecord } from "@/src/features/hour-meters/domain/entities";
import { HOUR_METER_PERMISSIONS } from "@/src/features/hour-meters/domain/permissions";
import { readHourMeters } from "@/src/features/hour-meters/infrastructure/server/hour-meter-actions";

export default async function HourMetersPage() {
  const supabase = await createTenantClient();
  if (!supabase) return <HourMeterContent initialRecords={[]} permissions={[]} />;
  const [{ data: company }, hourMeters] = await Promise.all([supabase.rpc("rbac_request_company_id"), readHourMeters()]);
  const { data: authorization } = company
    ? await supabase.rpc("authorization_projection", { p_company_id: company })
    : { data: null };
  const capabilities = (authorization?.capabilities ?? []) as Array<{ action: string; resource: string }>;
  const codes = capabilities.flatMap(({ action, resource }) => {
    if (resource !== "hour-meters") return [];
    if (action === "read") return [HOUR_METER_PERMISSIONS.access];
    if (action === "register") return [HOUR_METER_PERMISSIONS.register];
    return [];
  });
  const initialRecords: HourMeterRecord[] = hourMeters.ok ? hourMeters.data : [];
  return <HourMeterContent initialRecords={initialRecords} permissions={codes} />;
}
