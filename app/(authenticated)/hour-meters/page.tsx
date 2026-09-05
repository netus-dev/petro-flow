import { HourMeterContent } from "@/src/features/hour-meters/presentation/components/hour-meters-content";
import { createTenantClient } from "@/src/core/lib/supabase/server";
import { HourMeterRecord } from "@/src/features/hour-meters/domain/entities";
import { readHourMeters } from "@/src/features/hour-meters/infrastructure/server/hour-meter-actions";

export default async function HourMetersPage() {
  const supabase = await createTenantClient();
  if (!supabase) return <main role="alert">Tenant context is unavailable</main>;
  const [companyResponse, scopeResponse] = await Promise.all([supabase.rpc("rbac_request_company_id"), supabase.rpc("rbac_user_rig_scope")]);
  const company = companyResponse.data;
  const scope = scopeResponse?.data;
  const authorizationResponse = company
    ? await supabase.rpc("authorization_projection", { p_company_id: company })
    : null;
  const authorization = authorizationResponse?.data;
  const authorizationError = companyResponse.error ?? scopeResponse.error ?? authorizationResponse?.error;
  if (authorizationError || !company || !scope?.assigned || !authorization) {
    return <main role="alert">{authorizationError?.message ?? "Authorization context is unavailable"}</main>;
  }
  const hourMeterAuthorization = {
    capabilities: (authorization.capabilities ?? []) as Array<{ action: string; resource: string }>,
    enabledModules: (authorization.enabled_modules ?? []) as string[],
  };
  const rigs = (scope?.rigs ?? []) as Array<{ id: string; name: string }>;
  const hourMeters = rigs[0] ? await readHourMeters(rigs[0].id) : { ok: false as const, error: "No active Rig is authorized." };
  if (!hourMeters.ok) return <main role="alert">{hourMeters.error}</main>;
  const initialRecords: HourMeterRecord[] = hourMeters.data;
  const { data: principles, error: principlesError } = await supabase.from("functional_principles").select("id, name").eq("company_id", company).order("name");
  if (principlesError) return <main role="alert">{principlesError.message}</main>;
  return <HourMeterContent initialRecords={initialRecords} authorization={hourMeterAuthorization} principles={(principles ?? []) as Array<{ id: string; name: string }>} rigs={rigs} initialRigId={rigs[0]?.id} />;
}
