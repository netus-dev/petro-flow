import { left, right, type Either } from "../../../core/utils/either";
import { can, type AuthorizationProjection } from "../../authorization/domain/authorization";
import type { AccessControlCommand, AccessControlRepository, AuditEvent, AccessControlSnapshot } from "../domain/access-control";

export interface AccessControlFailure { message: string; code: "forbidden" | "repository" }

/** Reads the complete developer panel projection behind the global capability. */
export class ReadAccessControlSnapshot {
  constructor(private readonly repository: AccessControlRepository, private readonly authorize: () => Promise<AuthorizationProjection | null>) {}
  async execute(): Promise<Either<AccessControlFailure, AccessControlSnapshot>> {
    const projection = await this.authorize();
    if (!projection || !can(projection, { action: "manage", resource: "access-control" })) return left({ code: "forbidden", message: "Access-control administration is forbidden." });
    try { return right(await this.repository.readSnapshot()); }
    catch (error) { return left({ code: "repository", message: error instanceof Error ? error.message : "Access-control read failed." }); }
  }
}

/** Executes administration commands only when the caller has the global capability. */
export class ExecuteAccessControlCommand {
  constructor(private readonly repository: AccessControlRepository, private readonly authorize: () => Promise<AuthorizationProjection | null>) {}

  async execute(command: AccessControlCommand): Promise<Either<AccessControlFailure, void>> {
    const projection = await this.authorize();
    if (!projection || !can(projection, { action: "manage", resource: "access-control" })) {
      return left({ code: "forbidden", message: "Access-control administration is forbidden." });
    }
    try {
      switch (command.type) {
        case "create-role": await this.repository.createRole(command.role.name, command.companyId); break;
        case "update-role": await this.repository.updateRole(command.roleId, command.role.name, command.companyId); break;
        case "delete-role": await this.repository.deleteRole(command.roleId, command.companyId); break;
        case "create-company": await this.repository.createCompany(command.company.name); break;
        case "update-company": await this.repository.updateCompany(command.companyId, command.company.name); break;
        case "set-company": await this.repository.setCompany(command.companyId, command.isActive); break;
        case "set-user": await this.repository.setUser(command.userId, command.isActive); break;
        case "set-permission": await this.repository.setRolePermission(command.roleId, command.permissionId, command.enabled, command.companyId); break;
        case "set-entitlement": await this.repository.setEntitlement(command.entitlement); break;
        case "set-membership": await this.repository.setMembership(command.membership); break;
        case "remove-membership": await this.repository.removeMembership(command.membership); break;
        case "set-assignment": await this.repository.setAssignment(command.assignment); break;
        case "remove-assignment": await this.repository.removeAssignment(command.assignment); break;
        case "set-operational-scope": await this.repository.setOperationalScope(command.scope); break;
        case "remove-operational-scope": await this.repository.removeOperationalScope(command.companyId, command.userId); break;
      }
      return right(undefined);
    } catch (error) {
      return left({ code: "repository", message: error instanceof Error ? error.message : "Access-control operation failed." });
    }
  }
}

/** Reads immutable authorization history through the same capability boundary. */
export class ReadAuthorizationAudit {
  constructor(private readonly repository: AccessControlRepository, private readonly authorize: () => Promise<AuthorizationProjection | null>) {}

  async execute(companyId?: string): Promise<Either<AccessControlFailure, AuditEvent[]>> {
    const projection = await this.authorize();
    if (!projection || !can(projection, { action: "read", resource: "authorization-audit" })) {
      return left({ code: "forbidden", message: "Authorization audit is forbidden." });
    }
    try { return right(await this.repository.listAuditEvents(companyId)); }
    catch (error) { return left({ code: "repository", message: error instanceof Error ? error.message : "Audit read failed." }); }
  }
}

/** Records an audit event through the immutable database RPC boundary. */
export class WriteAuthorizationAudit {
  constructor(private readonly repository: AccessControlRepository, private readonly authorize: () => Promise<AuthorizationProjection | null>) {}
  async execute(event: Omit<AuditEvent, "id" | "createdAt">): Promise<Either<AccessControlFailure, void>> {
    const projection = await this.authorize();
    if (!projection || !can(projection, { action: "manage", resource: "access-control" })) return left({ code: "forbidden", message: "Authorization audit is forbidden." });
    try { await this.repository.appendAuditEvent(event); return right(undefined); }
    catch (error) { return left({ code: "repository", message: error instanceof Error ? error.message : "Audit write failed." }); }
  }
}
