"use server";

import { cookies, headers } from "next/headers";
import { createClient } from "@/src/core/lib/supabase/server";
import { COMPANY_CONTEXT_COOKIE, newCompanyContext, sealCompanyContext } from "@/src/features/authorization/infrastructure/server/company-context";
import { isSameRequestOrigin } from "./request-origin";

export type CompanyContextActionResult =
  | { status: "ok" }
  | { status: "forbidden" }
  | { status: "error"; message: string };

export async function listActiveCompanyMemberships() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("rbac_active_company_memberships");
    if (error) return { status: "error" as const, message: "No se pudieron cargar las compañías disponibles" };
    return {
      status: "ok" as const,
      memberships: (data ?? []).map((row: { company_id: string; company_name: string }) => ({ companyId: row.company_id, companyName: row.company_name })),
    };
  } catch {
    return { status: "error" as const, message: "No se pudieron cargar las compañías disponibles" };
  }
}

export async function selectCompanyAfterLogin(companyId: string): Promise<CompanyContextActionResult> {
  try {
    const requestHeaders = await headers();
    const origin = requestHeaders.get("origin");
    if (!isSameRequestOrigin(origin, requestHeaders.get("host"), requestHeaders.get("x-forwarded-proto"))) return { status: "forbidden" };
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("authorization_projection", { p_company_id: companyId });
    if (error || !data) return { status: "forbidden" };
    const secret = process.env.AUTHORIZATION_CONTEXT_SECRET;
    if (!secret) return { status: "error", message: "No se pudo establecer el contexto de compañía" };
    const sealed = sealCompanyContext(newCompanyContext(companyId), secret);
    (await cookies()).set(COMPANY_CONTEXT_COOKIE, sealed.value, sealed.options);
    return { status: "ok" };
  } catch {
    return { status: "error", message: "No se pudo establecer el contexto de compañía" };
  }
}
