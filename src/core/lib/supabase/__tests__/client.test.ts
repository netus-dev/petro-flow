import { describe, expect, it, vi } from "vitest";

const { browserClient } = vi.hoisted(() => ({
  browserClient: {
    auth: { getSession: vi.fn() },
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => browserClient),
}));

import { createClient } from "../client";

describe("browser Supabase client", () => {
  it("allows authentication APIs without exposing business table queries", () => {
    const client = createClient();

    expect(client.auth).toBe(browserClient.auth);
    expect(() => client.from("assets")).toThrow("validated tenant context");
    expect(browserClient.from).not.toHaveBeenCalled();
  });

  it.each(["storage", "functions", "channel", "schema"] as const)(
    "blocks the %s data surface before network access",
    (surface) => {
      const client = createClient();

      expect(() => (client as unknown as Record<string, unknown>)[surface]).toThrow(
        "validated tenant context",
      );
      expect(browserClient.from).not.toHaveBeenCalled();
      expect(browserClient.rpc).not.toHaveBeenCalled();
    },
  );

  it("allows only the profile RPC used during authentication", async () => {
    const client = createClient();
    browserClient.rpc.mockResolvedValue({ data: null, error: null });

    await client.rpc("get_user_profile", { p_user_id: "user-a" });

    expect(browserClient.rpc).toHaveBeenCalledWith("get_user_profile", { p_user_id: "user-a" });
    expect(() => client.rpc("rbac_active_company_memberships")).toThrow("validated tenant context");
  });
});
