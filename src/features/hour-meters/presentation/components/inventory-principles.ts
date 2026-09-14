import { HourMeterRecord } from "../../domain/entities";

export interface InventoryPrincipleOption {
  id: string;
  name: string;
}

/** Projects only unique principles represented by the current Dashboard records. */
export function deriveVisibleInventoryPrinciples(
  records: readonly HourMeterRecord[],
  principles: readonly InventoryPrincipleOption[],
): InventoryPrincipleOption[] {
  const visibleIds = new Set(
    records
      .map((record) => record.functionalPrincipleId?.trim())
      .filter((id): id is string => Boolean(id)),
  );
  return principles.filter((principle) => visibleIds.has(principle.id));
}
