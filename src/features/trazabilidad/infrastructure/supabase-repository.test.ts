import { beforeEach, describe, expect, it, vi } from "vitest";
import { SupabaseTrazabilidadRepository } from "./supabase-repository";

const rpc = vi.fn();
vi.mock("@/src/core/lib/supabase/client", () => ({
  createClient: () => ({ rpc }),
}));

describe("SupabaseTrazabilidadRepository movement writes", () => {
  beforeEach(() => rpc.mockReset());

  it("uses the atomic bulk RPC and does not send certificate files", async () => {
    rpc.mockResolvedValue({ data: "transaction-id", error: null });
    const repository = new SupabaseTrazabilidadRepository();
    const certificates = [{ file: new File(["x"], "certificate.pdf"), name: "certificate.pdf" }];

    await repository.registerBulkMovement({
      type: "transfer",
      origin_location_id: "origin",
      destination_location_id: "destination",
      destination_ubication_id: "ubication",
      justification: "Move",
      assets: [{ asset_id: "asset" }],
      certificates,
    });

    expect(rpc).toHaveBeenCalledWith("register_bulk_movement", {
      p_payload: expect.objectContaining({ assets: [{ asset_id: "asset" }] }),
    });
    expect(rpc.mock.calls[0][1].p_payload).not.toHaveProperty("certificates");
  });

  it("propagates atomic RPC failures without attempting fallback writes", async () => {
    const error = new Error("cross-tenant reference rejected");
    rpc.mockResolvedValue({ data: null, error });
    const repository = new SupabaseTrazabilidadRepository();

    await expect(repository.registerReplacementMovement({
      type: "replacement",
      location_id: "location",
      asset_a_id: "asset-a",
      asset_b_id: "asset-b",
      asset_b_destination_ubication_id: "ubication",
      justification: "Replace",
    })).rejects.toBe(error);
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
