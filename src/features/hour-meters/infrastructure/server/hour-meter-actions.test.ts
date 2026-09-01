import { beforeEach, describe, expect, it, vi } from "vitest";

const createTenantClient = vi.hoisted(() => vi.fn());

vi.mock("@/src/core/lib/supabase/server", () => ({ createTenantClient }));

import { readDailyOperationsKpi, readHourMeters, registerHourMeter } from "./hour-meter-actions";

describe("Hourmeter server actions", () => {
  beforeEach(() => createTenantClient.mockReset());

  it("returns a tenant error without attempting business queries when context is unavailable", async () => {
    createTenantClient.mockResolvedValue(null);

    await expect(readHourMeters()).resolves.toEqual({ ok: false, error: "Tenant context is unavailable" });
    await expect(readDailyOperationsKpi("asset-1")).resolves.toEqual({ ok: false, error: "Tenant context is unavailable" });
    await expect(registerHourMeter({ assetId: "asset-1", capturedAt: "2026-01-01T00:00:00Z", currentReading: 1, dieselAccumulatedGallons: 1, dailyMwAccumulated: 1, dailyMvarAccumulated: 1 })).resolves.toEqual({ ok: false, error: "Tenant context is unavailable" });
  });

  it("returns plain serializable records across the server action boundary", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{
        id: "asset-1",
        current_location_id: "location-1",
        functional_principles: { name: "Motor de Combustión Interna" },
        locations: { name: "North Platform" },
        asset_operational_parameters_history: [],
      }],
      error: null,
    });
    createTenantClient.mockResolvedValue({
      from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ order })) })) })),
    });

    const result = await readHourMeters();

    expect(structuredClone(result)).toEqual(result);
    expect(result).toMatchObject({ ok: true, data: [{ assetId: "asset-1", equipment: "Motor de Combustión Interna" }] });
  });

  it("rejects invalid registration input before calling the repository", async () => {
    const rpc = vi.fn();
    const from = vi.fn();
    createTenantClient.mockResolvedValue({ rpc, from });

    const result = await registerHourMeter({ assetId: "", capturedAt: "", currentReading: -1, dieselAccumulatedGallons: -1, dailyMwAccumulated: -1, dailyMvarAccumulated: -1 });

    expect(result).toMatchObject({
      ok: false,
      error: "Revisa los campos indicados.",
      fieldErrors: {
        assetId: "Selecciona un equipo.",
        capturedAt: "Ingresa la fecha y hora.",
      },
    });
    expect(rpc).not.toHaveBeenCalled();
    expect(from).not.toHaveBeenCalled();
    expect(structuredClone(result)).toEqual(result);
  });
});
