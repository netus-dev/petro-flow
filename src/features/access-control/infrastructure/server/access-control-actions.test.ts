import { describe, expect, it } from "vitest";
import { validateAccessControlCommand } from "./access-control-command-validation";

const companyId = "21000000-0000-0000-0000-000000000001";
const roleId = "31000000-0000-0000-0000-000000000001";

describe("access-control action validation", () => {
  it("rejects malformed discriminated payloads and UUIDs", () => {
    expect(validateAccessControlCommand({ type: "set-company", companyId, isActive: "true" })).toBeNull();
    expect(validateAccessControlCommand({ type: "set-assignment", assignment: { companyId, userId: "not-a-uuid", roleId } })).toBeNull();
  });

  it("accepts complete tenant-scoped payloads", () => {
    expect(validateAccessControlCommand({ type: "set-entitlement", entitlement: { companyId, moduleKey: "operations", enabled: true } })).toMatchObject({ type: "set-entitlement" });
  });
});
