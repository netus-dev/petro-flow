import type { Capability } from "../../authorization/domain/authorization";

export interface Role { id: string; name: string }
export interface Permission extends Capability { id: string }
export interface Company { id: string; name: string; isActive: boolean }
export interface ModuleEntitlement { companyId: string; moduleKey: string; enabled: boolean }
export interface Membership { companyId: string; userId: string; isActive: boolean }
export interface RoleAssignment { companyId: string; userId: string; roleId: string }
export interface AccessControlSnapshot {
  roles: Role[];
  permissions: Permission[];
  companies: Company[];
  memberships: Membership[];
  entitlements: ModuleEntitlement[];
  assignments: RoleAssignment[];
  auditEvents: AuditEvent[];
}
export interface AuditEvent {
  id: number;
  actorId: string | null;
  companyId: string | null;
  eventType: string;
  outcome: "allowed" | "denied";
  target: Record<string, unknown>;
  createdAt: string;
}

export type AccessControlResource = "roles" | "permissions" | "entitlements" | "memberships" | "assignments";
export type AccessControlCommand =
  | { type: "create-role"; role: Pick<Role, "name"> }
  | { type: "delete-role"; roleId: string }
  | { type: "create-company"; company: Pick<Company, "name"> }
  | { type: "set-company"; companyId: string; isActive: boolean }
  | { type: "set-permission"; roleId: string; permissionId: string; enabled: boolean }
  | { type: "set-entitlement"; entitlement: ModuleEntitlement }
  | { type: "set-membership"; membership: Membership }
  | { type: "set-assignment"; assignment: RoleAssignment };

export interface AccessControlRepository {
  readSnapshot(): Promise<AccessControlSnapshot>;
  createRole(name: string): Promise<Role>;
  deleteRole(roleId: string): Promise<void>;
  createCompany(name: string): Promise<Company>;
  setCompany(companyId: string, isActive: boolean): Promise<void>;
  setRolePermission(roleId: string, permissionId: string, enabled: boolean): Promise<void>;
  setEntitlement(entitlement: ModuleEntitlement): Promise<void>;
  setMembership(membership: Membership): Promise<void>;
  setAssignment(assignment: RoleAssignment): Promise<void>;
  listAuditEvents(companyId?: string): Promise<AuditEvent[]>;
  appendAuditEvent(event: Omit<AuditEvent, "id" | "createdAt">): Promise<void>;
}
