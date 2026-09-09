import { beforeEach, describe, expect, it, vi } from "vitest";

const { createTenantClient, repository } = vi.hoisted(() => ({
  createTenantClient: vi.fn(),
  repository: {
    getAssetList: vi.fn(),
    getDashboardStats: vi.fn(),
    getMovementList: vi.fn(),
  },
}));

vi.mock("@/src/core/lib/supabase/server", () => ({ createTenantClient }));
vi.mock("../supabase-repository", () => ({
  SupabaseTrazabilidadRepository: class {
    constructor() {
      return repository;
    }
  },
}));

import { readTrazabilidadData } from "./trazabilidad-actions";

describe("trazabilidad server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTenantClient.mockResolvedValue({});
    repository.getAssetList.mockResolvedValue(["asset"]);
    repository.getDashboardStats.mockResolvedValue({ total: 1 });
    repository.getMovementList.mockResolvedValue(["movement"]);
  });

  it("composes reads with a validated tenant client", async () => {
    await expect(readTrazabilidadData()).resolves.toEqual([
      ["asset"],
      { total: 1 },
      ["movement"],
    ]);
    expect(createTenantClient).toHaveBeenCalledOnce();
  });

  it("fails before repository composition when tenant validation is unavailable", async () => {
    createTenantClient.mockResolvedValue(null);

    await expect(readTrazabilidadData()).rejects.toThrow("Tenant context is unavailable");
  });
});
