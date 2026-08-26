import { cookies } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { createClient } from "../../../../core/lib/supabase/server";
import { can, mapProjection, type Capability } from "../../domain/authorization";
import { COMPANY_CONTEXT_COOKIE, readCompanyContext } from "./company-context";

const secret = () => process.env.AUTHORIZATION_CONTEXT_SECRET!;

/** Loads a fresh server-authoritative projection for the current browser context. */
export async function loadAuthorization() {
  const cookieStore = await cookies();
  const context = readCompanyContext(cookieStore.get(COMPANY_CONTEXT_COOKIE)?.value, secret());
  if (!context) return { status: "context_required" as const };
  const supabase = await createClient();
  const { data: renewed } = await supabase.rpc("rbac_renew_authorization", { p_company_id: context.companyId });
  if (!renewed) {
    try { cookieStore.delete(COMPANY_CONTEXT_COOKIE); } catch { /* Cleared by the next writable response. */ }
    return { status: "context_required" as const };
  }
  const { data } = await supabase.rpc("authorization_projection", { p_company_id: context.companyId });
  return data ? { status: "ok" as const, projection: mapProjection(data) } : { status: "context_required" as const };
}

/** Produces selection redirect or HTTP 403 before protected content renders. */
export async function enforceCapability(requirement: Capability & { moduleKey?: string }) {
  const result = await loadAuthorization();
  if (result.status === "context_required") redirect("/select-company");
  if (!can(result.projection, requirement)) forbidden();
  return result.projection;
}
