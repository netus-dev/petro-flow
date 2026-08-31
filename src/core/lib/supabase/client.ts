import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const AUTHENTICATION_RPC_NAMES = new Set(["get_user_profile"]);

/**
 * Keeps the browser client useful for authentication while preventing it from
 * becoming an unscoped business-data client.
 */
function authenticationOnlyClient(client: SupabaseClient): SupabaseClient {
  const restrictedClient = {
    auth: client.auth,
    rpc: (name: string, ...args: unknown[]) => {
      if (!AUTHENTICATION_RPC_NAMES.has(name)) {
        throw new Error("Business RPCs require a validated tenant context");
      }
      return client.rpc(name, ...(args as [Record<string, unknown>?]));
    },
  };

  const blockedSurface = (surface: string) => () => {
    throw new Error(`${surface} requires a validated tenant context`);
  };

  Object.defineProperties(restrictedClient, {
    from: { get: blockedSurface("Business queries") },
    storage: { get: blockedSurface("Storage access") },
    functions: { get: blockedSurface("Edge functions") },
    channel: { get: blockedSurface("Realtime channels") },
    schema: { get: blockedSurface("Schema access") },
  });

  return restrictedClient as unknown as SupabaseClient;
}

export function createClient() {
  // Browser code cannot read the HttpOnly company cookie and is never a source of tenant authority.
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  return authenticationOnlyClient(client);
}

/** Browser tenant boundary; validation must happen in a server action or route. */
export function createTenantClient(): null {
  return null;
}
