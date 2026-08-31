import { describe, expect, it, vi, beforeEach } from "vitest";

const { createTenantClient, createItem, updateItem, deleteItem } = vi.hoisted(() => ({
  createTenantClient: vi.fn(),
  createItem: vi.fn().mockResolvedValue({ id: "1", name: "Item" }),
  updateItem: vi.fn().mockResolvedValue(undefined),
  deleteItem: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/src/core/lib/supabase/server", () => ({ createTenantClient }));
vi.mock("../supabase-repository", () => ({
  SupabaseCatalogsRepository: class {
    createItem = createItem;
    updateItem = updateItem;
    deleteItem = deleteItem;
  },
}));

import { createCatalogItem, updateCatalogItem, deleteCatalogItem } from "./catalog-actions";

describe("catalog server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["create", () => createCatalogItem("companies", { name: "Item", company_id: "spoofed" }), createItem],
    ["update", () => updateCatalogItem("companies", "1", { name: "Item", company_id: "spoofed" }), updateItem],
    ["delete", () => deleteCatalogItem("companies", "1"), deleteItem],
  ])("%s requires tenant context and does not query without it", async (_name, action, repositoryMethod) => {
    createTenantClient.mockResolvedValue(null);
    await expect(action()).resolves.toMatchObject({ ok: false, error: "Tenant context is unavailable" });
    expect(repositoryMethod).not.toHaveBeenCalled();
  });

  it("rejects invalid catalogs before creating a tenant client", async () => {
    await expect(createCatalogItem("invalid", { name: "Item" })).resolves.toEqual({ ok: false, error: "Invalid catalog" });
    await expect(updateCatalogItem("invalid", "1", { name: "Item" })).resolves.toEqual({ ok: false, error: "Invalid catalog item" });
    await expect(deleteCatalogItem("invalid", "1")).resolves.toEqual({ ok: false, error: "Invalid catalog item" });
    expect(createTenantClient).not.toHaveBeenCalled();
  });

  it("removes client company identity before mutation", async () => {
    createTenantClient.mockResolvedValue({});
    await createCatalogItem("companies", { name: "Item", company_id: "spoofed" });
    expect(createItem).toHaveBeenCalledWith("companies", { name: "Item" });
  });
});
