"use server";

import { cookies, headers } from "next/headers";
import { createClient } from "@/src/core/lib/supabase/server";
import { COMPANY_CONTEXT_COOKIE, newCompanyContext, sealCompanyContext } from "@/src/features/authorization/infrastructure/server/company-context";

export async function listActiveCompanyMemberships() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rbac_active_company_memberships");
  if (error) throw new Error("No se pudieron cargar las compañías disponibles");
  return (data ?? []).map((row: { company_id: string; company_name: string }) => ({ companyId: row.company_id, companyName: row.company_name }));
}

export async function selectCompanyAfterLogin(companyId: string) {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const expectedOrigin = `${requestHeaders.get("x-forwarded-proto") ?? "https"}://${requestHeaders.get("host")}`;
  if (origin !== expectedOrigin) return { status: "forbidden" as const };
  const supabase = await createClient();
  const { data } = await supabase.rpc("authorization_projection", { p_company_id: companyId });
  if (!data) return { status: "forbidden" as const };
  const sealed = sealCompanyContext(newCompanyContext(companyId), process.env.AUTHORIZATION_CONTEXT_SECRET!);
  (await cookies()).set(COMPANY_CONTEXT_COOKIE, sealed.value, sealed.options);
  return { status: "ok" as const };
}
