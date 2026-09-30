import { describe, expect, it } from "vitest";
import { ResolvedMaintenancePlan } from "../../domain/entities";
import { getMaintenanceInventoryPrincipleId } from "./maintenance-inventory";

const plan = (equipmentId: string): ResolvedMaintenancePlan => ({
  equipmentId,
  equipmentName: equipmentId,
  functionalPrincipleId: "principle-shared",
  currentReading: 100,
  nextThresholdHours: 500,
  activities: [],
  planType: "cyclic",
});

describe("maintenance inventory identity", () => {
  it("uses the same principle for different assets that share it", () => {
    expect(getMaintenanceInventoryPrincipleId(plan("asset-a"))).toBe(
      "principle-shared",
    );
    expect(getMaintenanceInventoryPrincipleId(plan("asset-b"))).toBe(
      "principle-shared",
    );
  });

  it("fails closed when no resolved maintenance plan exists", () => {
    expect(getMaintenanceInventoryPrincipleId(null)).toBeNull();
  });
});
