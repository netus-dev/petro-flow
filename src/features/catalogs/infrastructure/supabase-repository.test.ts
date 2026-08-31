import { describe, expect, it, vi } from "vitest";
import { SupabaseCatalogsRepository } from "./supabase-repository";

function client(rows: unknown[]) {
  const query = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    then: (resolve: (value: unknown) => unknown) => resolve({ data: rows, error: null }),
  };
  return { from: vi.fn(() => query), rpc: vi.fn() };
}

describe("SupabaseCatalogsRepository", () => {
  it("does not trust a browser-supplied company id", async () => {
    const supabase = client([{ id: "brand", name: "Brand" }]);
    const repository = new SupabaseCatalogsRepository(supabase as never);

    await repository.getItems("brands", "company-a");

    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(supabase.from().eq).not.toHaveBeenCalledWith("company_id", "company-a");
  });

  it("does not read or mutate without a tenant-scoped client", async () => {
    const repository = new SupabaseCatalogsRepository(null as never);

    await expect(repository.getItemById("brands", "brand")).resolves.toBeUndefined();
    await expect(repository.createItem("brands", { name: "Brand" })).rejects.toThrow("Tenant context is unavailable");
    await expect(repository.updateItem("brands", "brand", { name: "Brand" })).rejects.toThrow("Tenant context is unavailable");
    await expect(repository.deleteItem("brands", "brand")).rejects.toThrow("Tenant context is unavailable");
  });
});
