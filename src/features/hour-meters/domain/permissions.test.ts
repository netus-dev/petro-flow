import { describe, expect, it } from "vitest";
import { canUseHourMeterCapability, HOUR_METER_CAPABILITIES, HOUR_METERS_MODULE } from "./permissions";

describe("hour-meter permissions", () => {
  it("matches the deployed action, resource, and module triple", () => {
    expect(canUseHourMeterCapability(
      { capabilities: [HOUR_METER_CAPABILITIES.register], enabledModules: [HOUR_METERS_MODULE] },
      HOUR_METER_CAPABILITIES.register,
    )).toBe(true);
  });

  it("fails closed when the Hour Meters module is disabled", () => {
    expect(canUseHourMeterCapability(
      { capabilities: [HOUR_METER_CAPABILITIES.read], enabledModules: [] },
      HOUR_METER_CAPABILITIES.read,
    )).toBe(false);
  });

  it("does not treat read access as registration access", () => {
    expect(canUseHourMeterCapability(
      { capabilities: [HOUR_METER_CAPABILITIES.read], enabledModules: [HOUR_METERS_MODULE] },
      HOUR_METER_CAPABILITIES.register,
    )).toBe(false);
  });
});
