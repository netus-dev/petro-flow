import { describe, expect, expectTypeOf, it } from "vitest";
import {
  FunctionalPrincipleInventoryItem,
  getInventoryAvailability,
} from "./entities";

describe("functional-principle inventory entity", () => {
  it("uses a functional principle as its only inventory identity", () => {
    const item: FunctionalPrincipleInventoryItem = {
      id: "inventory-1",
      companyId: "company-1",
      functionalPrincipleId: "principle-1",
      material: "Oil filter",
      specification: "OF-240",
      quantityInStock: 3,
      minimumStock: 2,
      isActive: true,
    };

    expect(item.functionalPrincipleId).toBe("principle-1");
    expect(Object.keys(item)).not.toEqual(
      expect.arrayContaining(["assetId", "equipmentType", "scope"]),
    );
    expectTypeOf<FunctionalPrincipleInventoryItem>().not.toHaveProperty(
      "assetId",
    );
    expectTypeOf<FunctionalPrincipleInventoryItem>().not.toHaveProperty(
      "equipmentType",
    );
    expectTypeOf<FunctionalPrincipleInventoryItem>().not.toHaveProperty(
      "scope",
    );
  });

  it("derives availability from stock independently of principle identity", () => {
    expect(
      getInventoryAvailability({ quantityInStock: 3, minimumStock: 2 }),
    ).toBe("sufficient");
    expect(
      getInventoryAvailability({ quantityInStock: 0, minimumStock: 2 }),
    ).toBe("out_of_stock");
  });
});
