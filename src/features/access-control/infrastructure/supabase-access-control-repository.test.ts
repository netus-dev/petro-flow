import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTenantClient } from "../../../core/lib/supabase/server";
import { SupabaseAccessControlRepository } from "./supabase-access-control-repository";

vi.mock("../../../core/lib/supabase/server", () => ({
  createTenantClient: vi.fn(),
}));

const createTenantClientMock = vi.mocked(createTenantClient);

describe("SupabaseAccessControlRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed when the validated tenant client is unavailable", async () => {
    createTenantClientMock.mockResolvedValue(null);

    await expect(new SupabaseAccessControlRepository().readSnapshot()).rejects.toThrow(
      "A valid active company context is required.",
    );
  });

  it("preserves the safe PostgREST message without exposing structured details", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: {
        code: "42501",
        message: "access-control administration is forbidden",
        details: "private database policy details",
        hint: "private implementation hint",
      },
    });
    createTenantClientMock.mockResolvedValue({ rpc } as never);

    const operation = new SupabaseAccessControlRepository().readSnapshot();

    await expect(operation).rejects.toEqual(
      new Error("access-control administration is forbidden"),
    );
    await expect(operation).rejects.not.toThrow("private database policy details");
  });

  it("uses the validated tenant client for reads and writes", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: {}, error: null });
    createTenantClientMock.mockResolvedValue({ rpc } as never);
    const repository = new SupabaseAccessControlRepository();

    await repository.readSnapshot();
    await repository.createRole("Operator", "21000000-0000-0000-0000-000000000001");

    expect(createTenantClientMock).toHaveBeenCalledTimes(2);
    expect(rpc).toHaveBeenNthCalledWith(1, "rbac_admin_snapshot");
    expect(rpc).toHaveBeenNthCalledWith(2, "rbac_admin_command", {
      p_command: {
        type: "create-role",
        companyId: "21000000-0000-0000-0000-000000000001",
        role: { name: "Operator" },
      },
    });
  });
});
