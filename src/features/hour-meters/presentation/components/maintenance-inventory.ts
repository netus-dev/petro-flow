import { ResolvedMaintenancePlan } from "../../domain/entities";

/** Resolves the inventory aggregate key and fails closed without a plan. */
export function getMaintenanceInventoryPrincipleId(
  plan: ResolvedMaintenancePlan | null,
): string | null {
  return plan?.functionalPrincipleId.trim() || null;
}
