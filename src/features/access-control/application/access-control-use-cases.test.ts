import { describe, expect, it, vi } from "vitest";
import { ExecuteAccessControlCommand, ReadAccessControlSnapshot, ReadAuthorizationAudit, WriteAuthorizationAudit } from "./access-control-use-cases";
import type { AccessControlRepository } from "../domain/access-control";
import type { AuthorizationProjection } from "../../authorization/domain/authorization";

const repo = (): AccessControlRepository => ({ readSnapshot: vi.fn().mockResolvedValue({ roles: [], permissions: [], companies: [], memberships: [], entitlements: [], assignments: [], auditEvents: [] }), createRole: vi.fn(), deleteRole: vi.fn(), createCompany: vi.fn(), setCompany: vi.fn(), setRolePermission: vi.fn(), setEntitlement: vi.fn(), setMembership: vi.fn(), setAssignment: vi.fn(), listAuditEvents: vi.fn().mockResolvedValue([]), appendAuditEvent: vi.fn() });
const projection = (capabilities: AuthorizationProjection["capabilities"]): AuthorizationProjection => ({ userId: "u", activeCompanyId: "c", roles: [], capabilities, enabledModules: [] });

describe("access-control use cases", () => {
  it("denies non-admin CRUD without touching persistence", async () => {
    const repository = repo();
    const result = await new ExecuteAccessControlCommand(repository, async () => projection([])).execute({ type: "create-role", role: { name: "Operator" } });
    expect(result.isLeft()).toBe(true);
    expect(repository.createRole).not.toHaveBeenCalled();
  });
  it("allows global admin CRUD and keeps company assignment scoped", async () => {
    const repository = repo();
    const result = await new ExecuteAccessControlCommand(repository, async () => projection([{ action: "manage", resource: "access-control" }])).execute({ type: "set-assignment", assignment: { companyId: "company-b", userId: "user-a", roleId: "role" } });
    expect(result.isRight()).toBe(true);
    expect(repository.setAssignment).toHaveBeenCalledWith({ companyId: "company-b", userId: "user-a", roleId: "role" });
  });
  it("allows module entitlement and membership revocation commands", async () => {
    const repository = repo();
    const authorize = async () => projection([{ action: "manage", resource: "access-control" }]);
    const useCase = new ExecuteAccessControlCommand(repository, authorize);
    expect((await useCase.execute({ type: "set-entitlement", entitlement: { companyId: "company-b", moduleKey: "operations", enabled: false } })).isRight()).toBe(true);
    expect((await useCase.execute({ type: "set-membership", membership: { companyId: "company-b", userId: "user-a", isActive: false } })).isRight()).toBe(true);
    expect(repository.setEntitlement).toHaveBeenCalledWith({ companyId: "company-b", moduleKey: "operations", enabled: false });
    expect(repository.setMembership).toHaveBeenCalledWith({ companyId: "company-b", userId: "user-a", isActive: false });
  });
  it("reads the admin snapshot only for global administrators", async () => {
    const repository = repo();
    const result = await new ReadAccessControlSnapshot(repository, async () => projection([{ action: "manage", resource: "access-control" }])).execute();
    expect(result.isRight()).toBe(true);
    expect(repository.readSnapshot).toHaveBeenCalledOnce();
  });
  it("requires the audit capability for reads", async () => {
    const repository = repo();
    const result = await new ReadAuthorizationAudit(repository, async () => projection([])).execute();
    expect(result.isLeft()).toBe(true);
    expect(repository.listAuditEvents).not.toHaveBeenCalled();
  });
  it("writes audit events only through the admin capability", async () => {
    const repository = repo();
    const event = { actorId: "u", companyId: "c", eventType: "membership.revoked", outcome: "allowed" as const, target: { userId: "member" } };
    const result = await new WriteAuthorizationAudit(repository, async () => projection([{ action: "manage", resource: "access-control" }])).execute(event);
    expect(result.isRight()).toBe(true);
    expect(repository.appendAuditEvent).toHaveBeenCalledWith(event);
  });
});
