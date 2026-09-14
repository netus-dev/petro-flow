import { describe, expect, it } from "vitest";
import { HourMeterRecord } from "../../domain/entities";
import { deriveVisibleInventoryPrinciples } from "./inventory-principles";

const record = (
  id: string,
  functionalPrincipleId?: string,
): HourMeterRecord => ({
  id,
  assetId: id,
  platform: "Rig 702",
  equipment: `Asset ${id}`,
  currentReading: 100,
  previousReading: 90,
  unit: "hrs",
  lastUpdated: "2026-09-13",
  maxThreshold: 500,
  status: "normal",
  lastMaintenanceDate: null,
  lastMaintenanceReading: null,
  dieselAccumulatedGallons: null,
  dailyMwAccumulated: null,
  dailyMvarAccumulated: null,
  functionalPrincipleId,
});

describe("deriveVisibleInventoryPrinciples", () => {
  const principles = [
    { id: "principle-a", name: "Internal Combustion Engine" },
    { id: "principle-b", name: "Mud Pump" },
    { id: "principle-catalog-only", name: "Top Drive" },
  ];

  it("returns each principle represented by visible assets exactly once", () => {
    expect(
      deriveVisibleInventoryPrinciples(
        [
          record("asset-1", "principle-a"),
          record("asset-2", "principle-a"),
          record("asset-3", "principle-b"),
        ],
        principles,
      ),
    ).toEqual([
      { id: "principle-a", name: "Internal Combustion Engine" },
      { id: "principle-b", name: "Mud Pump" },
    ]);
  });

  it("excludes missing IDs and catalog-only principles", () => {
    expect(
      deriveVisibleInventoryPrinciples(
        [record("asset-1"), record("asset-2", "principle-a")],
        principles,
      ),
    ).toEqual([
      { id: "principle-a", name: "Internal Combustion Engine" },
    ]);
    expect(deriveVisibleInventoryPrinciples([], principles)).toEqual([]);
  });
});
