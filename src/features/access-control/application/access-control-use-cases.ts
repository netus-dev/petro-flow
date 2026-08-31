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
        case "create-role": return left({ code: "forbidden", message: "Company-scoped role administration is unavailable." });
        case "delete-role": return left({ code: "forbidden", message: "Global role administration is forbidden." });
        case "create-company": return left({ code: "forbidden", message: "Global company administration is forbidden." });
        case "set-company": return left({ code: "forbidden", message: "Global company administration is forbidden." });
        case "set-permission": return left({ code: "forbidden", message: "Global permission administration is forbidden." });
        case "set-entitlement": await this.repository.setEntitlement(command.entitlement); break;
        case "set-membership": await this.repository.setMembership(command.membership); break;
        case "set-assignment": await this.repository.setAssignment(command.assignment); break;
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
