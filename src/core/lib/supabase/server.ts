import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { COMPANY_CONTEXT_COOKIE, companyHeaderForValidatedContext, readCompanyContext } from "@/src/features/authorization/infrastructure/server/company-context";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    cookieOptions(cookieStore),
  );
}

function cookieOptions(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method may be called from a Server Component.
        }
      },
    },
  };
}

/** Returns a tenant-scoped client or null; never falls back to an unscoped client. */
export async function createTenantClient() {
  const cookieStore = await cookies();
  const secret = process.env.AUTHORIZATION_CONTEXT_SECRET;
  if (!secret) return null;
  const context = readCompanyContext(cookieStore.get(COMPANY_CONTEXT_COOKIE)?.value, secret);
  if (!context) return null;
  const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    ...cookieOptions(cookieStore),
    global: { headers: companyHeaderForValidatedContext(context, context.companyId) },
  });
  const { data: authorized, error } = await client.rpc("rbac_renew_authorization", { p_company_id: context.companyId });
  if (error || !authorized) return null;
  return client;
}
