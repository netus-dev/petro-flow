import type { Capability } from "../../authorization/domain/authorization";

export interface Role { id: string; name: string; companyId?: string }
export interface Permission extends Capability { id: string }
export interface Company { id: string; name: string; isActive: boolean }
export interface AdminUser { id: string; email: string | null; isActive: boolean }
export interface ModuleEntitlement { companyId: string; moduleKey: string; enabled: boolean }
export interface Membership { companyId: string; userId: string; isActive: boolean }
export interface RoleAssignment { companyId: string; userId: string; roleId: string }
export type OperationalScopeMode = "specific_rig" | "all_rigs"
export interface OperationalScope { companyId: string; userId: string; mode: OperationalScopeMode; rigIds: string[] }
export interface RolePermission { roleId: string; permissionId: string }
export interface AccessControlSnapshot {
  roles: Role[];
  permissions: Permission[];
  rolePermissions: RolePermission[];
  companies: Company[];
  users: AdminUser[];
  memberships: Membership[];
  entitlements: ModuleEntitlement[];
  assignments: RoleAssignment[];
  operationalScopes: OperationalScope[];
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
  | { type: "create-role"; companyId: string; role: Pick<Role, "name"> }
  | { type: "update-role"; companyId: string; roleId: string; role: Pick<Role, "name"> }
  | { type: "delete-role"; companyId: string; roleId: string }
  | { type: "create-company"; company: Pick<Company, "name"> }
  | { type: "update-company"; companyId: string; company: Pick<Company, "name"> }
  | { type: "set-company"; companyId: string; isActive: boolean }
  | { type: "set-user"; userId: string; isActive: boolean }
  | { type: "set-permission"; companyId: string; roleId: string; permissionId: string; enabled: boolean }
  | { type: "set-entitlement"; entitlement: ModuleEntitlement }
  | { type: "set-membership"; membership: Membership }
  | { type: "remove-membership"; membership: Pick<Membership, "companyId" | "userId"> }
  | { type: "set-assignment"; assignment: RoleAssignment }
  | { type: "remove-assignment"; assignment: RoleAssignment }
  | { type: "set-operational-scope"; scope: OperationalScope }
  | { type: "remove-operational-scope"; companyId: string; userId: string };

export interface AccessControlRepository {
  readSnapshot(): Promise<AccessControlSnapshot>;
  createRole(name: string, companyId: string): Promise<Role>;
  updateRole(roleId: string, name: string, companyId: string): Promise<void>;
  deleteRole(roleId: string, companyId: string): Promise<void>;
  createCompany(name: string): Promise<Company>;
  updateCompany(companyId: string, name: string): Promise<void>;
  setCompany(companyId: string, isActive: boolean): Promise<void>;
  setUser(userId: string, isActive: boolean): Promise<void>;
  setRolePermission(roleId: string, permissionId: string, enabled: boolean, companyId: string): Promise<void>;
  setEntitlement(entitlement: ModuleEntitlement): Promise<void>;
  setMembership(membership: Membership): Promise<void>;
  removeMembership(membership: Pick<Membership, "companyId" | "userId">): Promise<void>;
  setAssignment(assignment: RoleAssignment): Promise<void>;
  removeAssignment(assignment: RoleAssignment): Promise<void>;
  setOperationalScope(scope: OperationalScope): Promise<void>;
  removeOperationalScope(companyId: string, userId: string): Promise<void>;
  listAuditEvents(companyId?: string): Promise<AuditEvent[]>;
  appendAuditEvent(event: Omit<AuditEvent, "id" | "createdAt">): Promise<void>;
}
