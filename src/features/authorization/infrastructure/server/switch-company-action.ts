"use server";

import { cookies, headers } from "next/headers";
import { createClient } from "../../../../core/lib/supabase/server";
import { switchCompany } from "../../application/switch-company";
import { COMPANY_CONTEXT_COOKIE, newCompanyContext, sealCompanyContext } from "./company-context";

/** Same-origin action that changes only this browser session's active company. */
export async function switchCompanyAction(companyId: string) {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const expectedOrigin = `${requestHeaders.get("x-forwarded-proto") ?? "https"}://${requestHeaders.get("host")}`;
  const cookieStore = await cookies();
  const supabase = await createClient();
  return switchCompany(companyId, origin, {
    origin: expectedOrigin,
    project: async (id) => (await supabase.rpc("authorization_projection", { p_company_id: id })).data,
    invalidate: () => undefined,
    write: (id) => {
      const sealed = sealCompanyContext(newCompanyContext(id), process.env.AUTHORIZATION_CONTEXT_SECRET!);
      cookieStore.set(COMPANY_CONTEXT_COOKIE, sealed.value, sealed.options);
    },
  });
}
