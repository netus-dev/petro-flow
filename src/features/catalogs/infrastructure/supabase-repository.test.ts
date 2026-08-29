import { describe, expect, it, vi } from "vitest";
import { SupabaseCatalogsRepository } from "./supabase-repository";

function client(rows: unknown[], authorized = true) {
  const query = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    then: (resolve: (value: unknown) => unknown) => resolve({ data: rows, error: null }),
  };
  return { from: vi.fn(() => query), rpc: vi.fn().mockResolvedValue({ data: authorized, error: null }) };
}

describe("SupabaseCatalogsRepository", () => {
  it("renews the active RBAC company and scopes catalog reads", async () => {
    const supabase = client([{ id: "brand", name: "Brand" }]);
    const repository = new SupabaseCatalogsRepository(supabase as never);

    await repository.getItems("brands", "company-a");

    expect(supabase.rpc).toHaveBeenCalledWith("rbac_renew_authorization", { p_company_id: "company-a" });
    expect(supabase.from().eq).toHaveBeenCalledWith("company_id", "company-a");
  });

  it("does not query when the active company is not authorized", async () => {
    const supabase = client([], false);
    const repository = new SupabaseCatalogsRepository(supabase as never);

    await expect(repository.getItems("brands", "company-b")).resolves.toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
