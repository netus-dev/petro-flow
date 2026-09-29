import { beforeEach, describe, expect, it, vi } from "vitest";
import { SupabaseTrazabilidadRepository } from "./supabase-repository";

const { rpc, uploadCertificateAction } = vi.hoisted(() => ({ rpc: vi.fn(), uploadCertificateAction: vi.fn() }));
const from = vi.fn();
const client = {
  rpc,
  from,
  auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user" } } }) },
  storage: { from: vi.fn(() => ({ createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: "signed-url" } }) })) },
} as never;
vi.mock("./server/certificate-actions", () => ({ uploadCertificateAction }));

describe("SupabaseTrazabilidadRepository", () => {
  beforeEach(() => { rpc.mockReset(); from.mockReset(); uploadCertificateAction.mockReset(); });

  it("counts active assets by status while preserving global location distribution", async () => {
    const assets = [
      { status: "active", locations: { name: "Rig 1", type: "rig" } },
      { status: "active", locations: { name: "Base 1", type: "operating_base" } },
      { status: "under_inspection", locations: { name: "Rig 1", type: "rig" } },
      { status: "rejected", locations: { name: "Base 1", type: "operating_base" } },
    ];
    const query = {
      select: vi.fn(() => query),
      eq: vi.fn(() => Promise.resolve({ data: assets, error: null })),
    };
    from.mockReturnValue(query);
    const repository = new SupabaseTrazabilidadRepository(client);

    await expect(repository.getDashboardStats()).resolves.toMatchObject({
      totalAssets: 4,
      assetsOperational: 2,
      assetsUnderInspection: 1,
      assetsRejected: 1,
      distributionByLocation: [
        { name: "Rig 1", value: 2 },
        { name: "Base 1", value: 2 },
      ],
    });
    expect(query.eq).toHaveBeenCalledWith("is_active", true);
  });

  it("delegates certificate upload and tenant metadata to the server boundary", async () => {
    uploadCertificateAction.mockResolvedValue("certificate-id");
    const repository = new SupabaseTrazabilidadRepository(client);
    await repository.addCertificate("asset", [{ file: new File(["x"], "certificate.pdf", { type: "application/pdf" }), name: "certificate.pdf" }]);
    expect(uploadCertificateAction).toHaveBeenCalledWith(expect.any(File), "certificate.pdf", "asset", undefined);
  });

  it("registers the movement and links each certificate once to the transaction", async () => {
    rpc.mockResolvedValue({ data: "transaction-id", error: null });
    uploadCertificateAction.mockResolvedValue("certificate-id");
    const repository = new SupabaseTrazabilidadRepository(client);
    const certificates = [{ file: new File(["x"], "certificate.pdf"), name: "certificate.pdf" }];

    await repository.registerBulkMovement({
      type: "transfer",
      origin_location_id: "origin",
      destination_location_id: "destination",
      destination_ubication_id: "ubication",
      justification: "Move",
      assets: [{ asset_id: "asset-a" }, { asset_id: "asset-b" }],
      certificates,
    });

    expect(rpc).toHaveBeenCalledWith("register_bulk_movement", {
      p_payload: expect.objectContaining({ assets: [{ asset_id: "asset-a" }, { asset_id: "asset-b" }] }),
    });
    expect(rpc.mock.calls[0][1].p_payload).not.toHaveProperty("certificates");
    expect(uploadCertificateAction).toHaveBeenCalledTimes(1);
    expect(uploadCertificateAction).toHaveBeenCalledWith(expect.any(File), "certificate.pdf", undefined, "transaction-id");
  });

  it("reports certificate upload failures after the movement succeeds", async () => {
    rpc.mockResolvedValue({ data: "transaction-id", error: null });
    uploadCertificateAction.mockRejectedValue(new Error("storage unavailable"));
    const repository = new SupabaseTrazabilidadRepository(client);

    await expect(repository.registerBulkMovement({
      type: "transfer",
      origin_location_id: "origin",
      destination_location_id: "destination",
      destination_ubication_id: "ubication",
      justification: "Move",
      assets: [{ asset_id: "asset" }],
      certificates: [{ file: new File(["x"], "certificate.pdf"), name: "certificate.pdf" }],
    })).rejects.toThrow("Movement registered, but certificate upload failed");
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("maps direct and movement certificates together without duplicates", async () => {
    const repository = new SupabaseTrazabilidadRepository(client);
    const mapRowToAsset = (repository as unknown as { mapRowToAsset: (row: unknown) => Promise<{ certificates: { id: string }[] }> }).mapRowToAsset.bind(repository);
    const asset = await mapRowToAsset({
      id: "asset",
      serial_number: "A-1",
      brands: { name: "Brand" },
      models: { name: "Model" },
      locations: { name: "Location" },
      ubications: { name: "Position" },
      functional_principles: { name: "Component" },
      assets_certificates: [{ certificates: { id: "direct", file_name: "direct.pdf" } }],
      transaction_details: [{ transactions: {
        id: "transaction",
        transactions_certificates: [
          { certificates: { id: "movement", file_name: "movement.pdf" } },
          { certificates: { id: "direct", file_name: "direct.pdf" } },
        ],
      } }],
    });

    expect(asset.certificates.map((certificate: { id: string }) => certificate.id)).toEqual(["direct", "movement"]);
  });

  it("propagates atomic RPC failures without attempting fallback writes", async () => {
    const error = new Error("cross-tenant reference rejected");
    rpc.mockResolvedValue({ data: null, error });
    const repository = new SupabaseTrazabilidadRepository(client);

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
