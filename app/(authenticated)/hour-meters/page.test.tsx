import { beforeEach, describe, expect, it, vi } from "vitest";
import { HOUR_METER_PERMISSIONS } from "@/src/features/hour-meters/domain/permissions";

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
      .mockResolvedValueOnce({ data: { capabilities: [{ action: "read", resource: "hour-meters" }] }, error: null });
    createTenantClient.mockResolvedValue({ rpc });
    readHourMeters.mockResolvedValue({ ok: true, data: [] });

    const element = await HourMetersPage();

    expect(createTenantClient).toHaveBeenCalledOnce();
    expect(rpc).toHaveBeenNthCalledWith(1, "rbac_request_company_id");
    expect(rpc).toHaveBeenNthCalledWith(2, "authorization_projection", { p_company_id: "company-1" });
    expect(element.props.permissions).toEqual([HOUR_METER_PERMISSIONS.access]);
  });

  it("fails closed when validated tenant context is unavailable", async () => {
    createTenantClient.mockResolvedValue(null);

    const element = await HourMetersPage();

    expect(readHourMeters).not.toHaveBeenCalled();
    expect(element.props).toMatchObject({ initialRecords: [], permissions: [] });
  });
});
