import { describe, expect, it } from "vitest";
import { validateMaintenanceThresholds } from "./maintenance-threshold-modal";

describe("MaintenanceThresholdModal form validation", () => {
  it("accepts positive integer thresholds and preserves form order", () => {
    expect(validateMaintenanceThresholds(["1000", "2000"])).toEqual([1000, 2000]);
  });

  it("rejects blank, fractional, non-positive, and duplicate values", () => {
    const message = "Los umbrales deben ser horas enteras positivas y no repetidas.";
    expect(validateMaintenanceThresholds([""])).toBe(message);
    expect(validateMaintenanceThresholds(["100.5"])).toBe(message);
    expect(validateMaintenanceThresholds(["0"])).toBe(message);
    expect(validateMaintenanceThresholds(["1000", "1000"])).toBe(message);
  });
});
