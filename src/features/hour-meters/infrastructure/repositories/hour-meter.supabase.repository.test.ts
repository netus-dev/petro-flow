import { describe, expect, it } from "vitest";
import { calculateOperationalDeltas } from "../../domain/entities";
import { HOURMETER_ELIGIBLE_PRINCIPLES, isHourMeterEligiblePrinciple, latestHistory, mapRow } from "./hour-meter.supabase.repository";

const row = (id: string, captured_at: string, hours: number | null) => ({
   id, asset_id: "asset-1", equipment: "Motor", platform: "", hours, unit: "hrs", captured_at, max_threshold: 5000,
  last_maintenance_date: null, last_maintenance_reading: null,
  diesel_accumulated_gallons: hours === null ? null : hours * 10,
   mw_accumulated: hours === null ? null : hours * 2,
   mvar_accumulated: null,
});

describe("Hourmeter infrastructure mapping", () => {
  it("uses the canonical functional-principle eligibility set", () => {
    expect(isHourMeterEligiblePrinciple(HOURMETER_ELIGIBLE_PRINCIPLES[0])).toBe(true);
    expect(isHourMeterEligiblePrinciple("Generador eléctrico")).toBe(false);
  });
  it("maps null readings as unreported instead of inventing values", () => {
    expect(mapRow(row("a", "2026-01-01T00:00:00Z", null))).toMatchObject({ currentReading: null, dieselAccumulatedGallons: null, status: "normal" });
  });

  it("selects the latest reading for an asset", () => {
    expect(latestHistory([row("old", "2026-01-01T00:00:00Z", 1), row("new", "2026-02-01T00:00:00Z", 2)])?.id).toBe("new");
  });

  it("calculates diesel and MW energy deltas, ignoring MVAR", () => {
    expect(calculateOperationalDeltas({ dieselAccumulatedGallons: 100, dailyMwAccumulated: 20 }, { dieselAccumulatedGallons: 135, dailyMwAccumulated: 28 })).toMatchObject({ dieselGallons: 35, generatedMw: 8 });
    expect(calculateOperationalDeltas(null, { dieselAccumulatedGallons: 135, dailyMwAccumulated: 28 })).toMatchObject({ dieselGallons: null, generatedMw: null });
  });
});
