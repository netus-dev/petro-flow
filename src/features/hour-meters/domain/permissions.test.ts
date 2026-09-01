import { describe, expect, it } from "vitest";
import { canUseHourMeterPermission, extractPermissionNames, HOUR_METER_PERMISSIONS } from "./permissions";

describe("hour-meter permissions", () => {
  it("matches only the typed permission requested", () => {
    expect(canUseHourMeterPermission([HOUR_METER_PERMISSIONS.register], HOUR_METER_PERMISSIONS.register)).toBe(true);
    expect(canUseHourMeterPermission([], HOUR_METER_PERMISSIONS.inventory)).toBe(false);
  });

  it("does not authorize a permission with a similar name", () => {
    expect(canUseHourMeterPermission(["hourmeters.register.extra"], HOUR_METER_PERMISSIONS.register)).toBe(false);
  });

  it("extracts deployed permission names and ignores missing nested values", () => {
    expect(extractPermissionNames([
      { roles: { role_permissions: [{ permissions: { name: HOUR_METER_PERMISSIONS.register } }, { permissions: null }] } },
      { roles: null },
    ])).toEqual([HOUR_METER_PERMISSIONS.register]);
  });
});
