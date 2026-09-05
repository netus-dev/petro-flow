import { beforeEach, describe, expect, it, vi } from "vitest";
import { HOUR_METER_CAPABILITIES, HOUR_METERS_MODULE } from "@/src/features/hour-meters/domain/permissions";

const createTenantClient = vi.hoisted(() => vi.fn());
const readHourMeters = vi.hoisted(() => vi.fn());

vi.mock("@/src/core/lib/supabase/server", () => ({ createTenantClient }));
vi.mock("@/src/features/hour-meters/infrastructure/server/hour-meter-actions", () => ({ readHourMeters }));
vi.mock("@/src/features/hour-meters/presentation/components/hour-meters-content", () => ({ HourMeterContent: vi.fn() }));

import HourMetersPage from "./page";

describe("HourMetersPage", () => {
  beforeEach(() => {
    createTenantClient.mockReset();
    readHourMeters.mockReset();
  });

  it("derives permissions through the validated tenant client", async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: "company-1", error: null })
      .mockResolvedValueOnce({ data: { assigned: true, rigs: [{ id: "rig-1", name: "Rig 1" }] }, error: null })
      .mockResolvedValueOnce({ data: { capabilities: [HOUR_METER_CAPABILITIES.read], enabled_modules: [HOUR_METERS_MODULE] }, error: null });
    createTenantClient.mockResolvedValue({ rpc, from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn().mockResolvedValue({ data: [], error: null }) })) })) })) });
    readHourMeters.mockResolvedValue({ ok: true, data: [] });

    const element = await HourMetersPage();

    expect(createTenantClient).toHaveBeenCalledOnce();
    expect(rpc).toHaveBeenNthCalledWith(1, "rbac_request_company_id");
    expect(rpc).toHaveBeenNthCalledWith(3, "authorization_projection", { p_company_id: "company-1" });
    expect(element.props.authorization).toEqual({ capabilities: [HOUR_METER_CAPABILITIES.read], enabledModules: [HOUR_METERS_MODULE] });
  });

  it("fails closed when validated tenant context is unavailable", async () => {
    createTenantClient.mockResolvedValue(null);

    const element = await HourMetersPage();

    expect(readHourMeters).not.toHaveBeenCalled();
    expect(element.props.role).toBe("alert");
    expect(element.props.children).toBe("Tenant context is unavailable");
  });

  it("preserves repository failures instead of rendering an empty-state result", async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: "company-1", error: null })
      .mockResolvedValueOnce({ data: { assigned: true, rigs: [{ id: "rig-1", name: "Rig 1" }] }, error: null })
      .mockResolvedValueOnce({ data: { capabilities: [HOUR_METER_CAPABILITIES.read], enabled_modules: [HOUR_METERS_MODULE] }, error: null });
    createTenantClient.mockResolvedValue({ rpc, from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn().mockResolvedValue({ data: [], error: null }) })) })) })) });
    readHourMeters.mockResolvedValue({ ok: false, error: "permission denied for table assets" });

    const element = await HourMetersPage();

    expect(element.props.role).toBe("alert");
    expect(element.props.children).toBe("permission denied for table assets");
  });
});
