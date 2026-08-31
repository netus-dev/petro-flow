import { describe, expect, it } from "vitest";
import { getInventoryAvailability } from "../../domain/entities";
import { GetAssetInventoryUseCase } from "./inventory.usecases";
import { MockInventoryRepository } from "../../infrastructure/repositories/inventory.mock.repository";

describe("asset inventory", () => {
  it("calculates sufficient, critical, and out-of-stock statuses", () => {
    expect(getInventoryAvailability({ quantityInStock: 3, minimumStock: 2 })).toBe("sufficient");
    expect(getInventoryAvailability({ quantityInStock: 2, minimumStock: 2 })).toBe("critical");
    expect(getInventoryAvailability({ quantityInStock: 0, minimumStock: 2 })).toBe("out_of_stock");
  });

  it("preserves explicit inventory scope metadata", async () => {
    const useCase = new GetAssetInventoryUseCase({ getByAssetId: async (assetId) => [{ id: "1", assetId, material: "Filtro", specification: "Parte", quantityInStock: 1, minimumStock: 1, scope: "asset", equipmentType: "Motor" }] });
    const result = await useCase.execute("ODO-001");
    expect(result.isRight() && result.value[0].assetId).toBe("ODO-001");
  });

  it("provides shared stock for every generator motor and mud pump mock asset", async () => {
    const repository = new MockInventoryRepository();
    for (const assetId of ["ODO-001", "ODO-002", "ODO-003", "ODO-004", "ODO-005", "ODO-006", "ODO-007", "ODO-008"]) {
      const items = await repository.getByAssetId(assetId);
      expect(items.length).toBeGreaterThan(0);
      expect(items.every((item) => item.scope === "shared_equipment_type")).toBe(true);
    }
  });
});
