import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { calculateOperationalDeltas } from "../../domain/entities";
import { HOURMETER_ELIGIBLE_PRINCIPLES, isHourMeterEligiblePrinciple, latestHistory, mapRow, SupabaseHourMeterRepository } from "./hour-meter.supabase.repository";

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

  it("reads assets using the columns and relations available in the local schema", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{
        id: "asset-1",
         company_id: "company-1",
         function_principle_id: "principle-1",
         current_location_id: "location-1",
         current_ubication_id: "ubication-1",
        functional_principles: { name: HOURMETER_ELIGIBLE_PRINCIPLES[0] },
         locations: { name: "North Rig" },
         ubications: { name: "North Position" },
        asset_operational_parameters_history: [],
      }],
      error: null,
    });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));
    const repository = new SupabaseHourMeterRepository({ from } as unknown as SupabaseClient);

    await expect(repository.getAll()).resolves.toMatchObject([
       { assetId: "asset-1", equipment: "North Position", platform: "North Rig", rigName: "North Rig" },
    ]);
      expect(select).toHaveBeenCalledWith("id, company_id, function_principle_id, current_location_id, current_ubication_id, functional_principles!assets_function_principle_id_fkey(name), locations!assets_current_location_id_fkey(name), ubications!assets_company_id_current_ubication_id_fkey(name), asset_operational_parameters_history!asset_operational_parameters_history_asset_id_fkey(*)");
  });

  it("falls back to the functional principle when an asset has no ubication", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{
        id: "asset-1",
         current_location_id: "location-1",
         current_ubication_id: null,
        functional_principles: { name: HOURMETER_ELIGIBLE_PRINCIPLES[0] },
         locations: { name: "North Rig" },
         ubications: null,
        asset_operational_parameters_history: [],
      }],
      error: null,
    });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));

    await expect(new SupabaseHourMeterRepository({ from } as unknown as SupabaseClient).getAll()).resolves.toMatchObject([
      { equipment: HOURMETER_ELIGIBLE_PRINCIPLES[0] },
    ]);
  });

  it("registers history with the validated request company", async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        ...row("reading-1", "2026-01-01T00:00:00Z", 10),
        assets: {
          functional_principles: { name: HOURMETER_ELIGIBLE_PRINCIPLES[0] },
            locations: { name: "North Rig" },
            ubications: { name: "North Position" },
        },
      },
      error: null,
    });
    const historySelect = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select: historySelect }));
    const from = vi.fn(() => ({ insert }));
    const rpc = vi.fn().mockResolvedValue({ data: "company-1", error: null });
    const repository = new SupabaseHourMeterRepository({ from, rpc } as unknown as SupabaseClient);

     await expect(repository.register({ assetId: "asset-1", capturedAt: "2026-01-01T00:00:00Z", currentReading: 10, dieselAccumulatedGallons: 100, dailyMwAccumulated: 20, dailyMvarAccumulated: 5 })).resolves.toMatchObject({ equipment: "North Position", rigName: "North Rig" });

    expect(rpc).toHaveBeenCalledWith("rbac_request_company_id");
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ company_id: "company-1", asset_id: "asset-1" }));
     expect(historySelect).toHaveBeenCalledWith("*, assets!asset_operational_parameters_history_asset_id_fkey(functional_principles!assets_function_principle_id_fkey(name), locations!assets_current_location_id_fkey(name), ubications!assets_company_id_current_ubication_id_fkey(name))");
  });
});
