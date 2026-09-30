import { InventoryInput } from "../../application/usecases/inventory.usecases";
import { InventoryPrincipleOption } from "./inventory-principles";

/** Creates a safe draft only when the Dashboard exposes an eligible principle. */
export function createInventoryDraft(
  principles: readonly InventoryPrincipleOption[],
): InventoryInput | null {
  const firstPrinciple = principles[0];
  if (!firstPrinciple) return null;
  return {
    functionalPrincipleId: firstPrinciple.id,
    material: "",
    specification: "",
    quantityInStock: 0,
    minimumStock: 0,
  };
}

/** Prevents stale or hidden principle IDs from reaching the mutation boundary. */
export function isInventoryDraftSubmittable(
  draft: InventoryInput | null,
  principles: readonly InventoryPrincipleOption[],
): draft is InventoryInput {
  return Boolean(
    draft && principles.some((principle) => principle.id === draft.functionalPrincipleId),
  );
}
