import { beforeEach, describe, expect, it, vi } from "vitest";
import { COMPANY_CONTEXT_MAX_AGE_MS, sealCompanyContext } from "@/src/features/authorization/infrastructure/server/company-context";

const { createServerClient, cookieStore } = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  cookieStore: { get: vi.fn(), getAll: vi.fn(() => []), set: vi.fn() },
}));

vi.mock("@supabase/ssr", () => ({ createServerClient }));
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => cookieStore) }));

import { createClient, createTenantClient } from "../server";

describe("server Supabase clients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTHORIZATION_CONTEXT_SECRET = "secret";
  });

  it.each([
    ["missing", undefined],
    ["invalid signature", "invalid"],
    ["stale", sealCompanyContext({ companyId: "company-a", contextId: "ctx", issuedAt: Date.now() - COMPANY_CONTEXT_MAX_AGE_MS - 1 }, "secret").value],
  ])("does not construct a client for %s context", async (_label, value) => {
    cookieStore.get.mockReturnValue(value ? { value } : undefined);

    await expect(createTenantClient()).resolves.toBeNull();

    expect(createServerClient).not.toHaveBeenCalled();
  });

  it("constructs one header-scoped client and renews authorization once", async () => {
    const value = sealCompanyContext({ companyId: "company-a", contextId: "ctx", issuedAt: Date.now() }, "secret").value;
    cookieStore.get.mockReturnValue({ value });
    const client = { rpc: vi.fn().mockResolvedValue({ data: true, error: null }) };
    createServerClient.mockReturnValue(client);

    await expect(createTenantClient()).resolves.toBe(client);

    expect(createServerClient).toHaveBeenCalledOnce();
    expect(createServerClient.mock.calls[0][2].global.headers).toEqual({ "x-company-id": "company-a" });
    expect(client.rpc).toHaveBeenCalledOnce();
    expect(client.rpc).toHaveBeenCalledWith("rbac_renew_authorization", { p_company_id: "company-a" });
  });

  it("keeps createClient available for pre-selection authentication", async () => {
    createServerClient.mockReturnValue({});

    await createClient();

    expect(createServerClient).toHaveBeenCalledOnce();
  });
});
