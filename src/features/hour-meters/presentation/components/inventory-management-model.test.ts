import { describe, expect, it } from "vitest";
import {
  createInventoryDraft,
  isInventoryDraftSubmittable,
} from "./inventory-management-model";

describe("inventory management model", () => {
  it("returns an unavailable state when no visible principle can be selected", () => {
    expect(createInventoryDraft([])).toBeNull();
    expect(isInventoryDraftSubmittable(null, [])).toBe(false);
  });

  it("creates a principle-only draft and rejects a hidden selection", () => {
    const principles = [{ id: "principle-a", name: "Mud Pump" }];
    const draft = createInventoryDraft(principles);

    expect(draft).toEqual({
      functionalPrincipleId: "principle-a",
      material: "",
      specification: "",
      quantityInStock: 0,
      minimumStock: 0,
    });
    expect(draft && Object.keys(draft)).not.toEqual(
      expect.arrayContaining(["assetId", "equipmentType", "scope"]),
    );
    expect(isInventoryDraftSubmittable(draft, principles)).toBe(true);
    expect(
      isInventoryDraftSubmittable(
        draft ? { ...draft, functionalPrincipleId: "principle-hidden" } : null,
        principles,
      ),
    ).toBe(false);
  });
});
