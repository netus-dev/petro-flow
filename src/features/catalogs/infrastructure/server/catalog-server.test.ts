import { describe, expect, it, vi } from "vitest";

const tenantClient = { from: vi.fn() };

vi.mock("@/src/core/lib/supabase/server", () => ({
  createTenantClient: vi.fn(),
}));

vi.mock("../supabase-repository", () => ({
  SupabaseCatalogsRepository: class {
    getItems = vi.fn().mockResolvedValue([{ id: "company-1", name: "Acme" }]);
  },
}));

import { createTenantClient } from "@/src/core/lib/supabase/server";
import { readCatalog } from "./catalog-server";

describe("readCatalog", () => {
  it("returns server-fetched data with a valid tenant context", async () => {
    vi.mocked(createTenantClient).mockResolvedValue(tenantClient as never);

    await expect(readCatalog("companies")).resolves.toEqual({
      ok: true,
      data: [{ id: "company-1", name: "Acme" }],
    });
  });

  it("fails closed without tenant context", async () => {
    vi.mocked(createTenantClient).mockResolvedValue(null);

    await expect(readCatalog("companies")).resolves.toEqual({
      ok: false,
      error: "Tenant context is unavailable",
    });
  });
});
