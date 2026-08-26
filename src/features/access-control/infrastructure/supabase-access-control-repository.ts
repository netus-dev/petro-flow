import { createClient } from "../../../core/lib/supabase/server";
import type { AccessControlRepository, AuditEvent, ModuleEntitlement, Membership, Role, RoleAssignment, AccessControlSnapshot, Permission, Company } from "../domain/access-control";

/** Maps Supabase rows into domain objects and keeps all persistence outside the UI. */
export class SupabaseAccessControlRepository implements AccessControlRepository {
  private async client() { return createClient(); }
  async createRole(name: string): Promise<Role> {
    const { data, error } = await (await this.client()).from("rbac_roles").insert({ name }).select("id,name").single();
    if (error) throw error; return data;
  }
  async deleteRole(roleId: string) { const { error } = await (await this.client()).from("rbac_roles").delete().eq("id", roleId); if (error) throw error; }
  async createCompany(name: string): Promise<Company> { const { data, error } = await (await this.client()).from("rbac_companies").insert({ name }).select("id,name,is_active").single(); if (error) throw error; return { id: data.id, name: data.name, isActive: data.is_active }; }
  async setCompany(companyId: string, isActive: boolean) { const { error } = await (await this.client()).from("rbac_companies").update({ is_active: isActive }).eq("id", companyId); if (error) throw error; }
  async setRolePermission(roleId: string, permissionId: string, enabled: boolean) {
    const db = await this.client();
    const result = enabled ? await db.from("rbac_role_permissions").upsert({ role_id: roleId, permission_id: permissionId }) : await db.from("rbac_role_permissions").delete().match({ role_id: roleId, permission_id: permissionId });
    if (result.error) throw result.error;
  }
  async setEntitlement(value: ModuleEntitlement) { const { error } = await (await this.client()).from("rbac_company_modules").upsert({ company_id: value.companyId, module_key: value.moduleKey, enabled: value.enabled }); if (error) throw error; }
  async setMembership(value: Membership) { const { error } = await (await this.client()).from("rbac_memberships").upsert({ company_id: value.companyId, user_id: value.userId, is_active: value.isActive }); if (error) throw error; }
  async setAssignment(value: RoleAssignment) { const { error } = await (await this.client()).from("rbac_assignments").upsert({ company_id: value.companyId, user_id: value.userId, role_id: value.roleId }); if (error) throw error; }
  async listAuditEvents(companyId?: string): Promise<AuditEvent[]> { let query = (await this.client()).from("rbac_audit_events").select("id,actor_id,company_id,event_type,outcome,target,created_at").order("created_at", { ascending: false }); if (companyId) query = query.eq("company_id", companyId); const { data, error } = await query; if (error) throw error; return (data ?? []).map((row) => ({ id: row.id, actorId: row.actor_id, companyId: row.company_id, eventType: row.event_type, outcome: row.outcome, target: row.target, createdAt: row.created_at })); }
  async appendAuditEvent(event: Omit<AuditEvent, "id" | "createdAt">) { const { error } = await (await this.client()).rpc("rbac_record_audit", { p_company_id: event.companyId, p_event_type: event.eventType, p_outcome: event.outcome, p_target: event.target }); if (error) throw error; }
  async readSnapshot(): Promise<AccessControlSnapshot> {
    const db = await this.client();
    const [roles, permissions, companies, memberships, entitlements, assignments, auditEvents] = await Promise.all([
      db.from("rbac_roles").select("id,name"), db.from("rbac_permissions").select("id,action,resource"),
      db.from("rbac_companies").select("id,name,is_active"), db.from("rbac_memberships").select("company_id,user_id,is_active"),
      db.from("rbac_company_modules").select("company_id,module_key,enabled"), db.from("rbac_assignments").select("company_id,user_id,role_id"),
      db.from("rbac_audit_events").select("id,actor_id,company_id,event_type,outcome,target,created_at").order("created_at", { ascending: false }),
    ]);
    const failure = [roles, permissions, companies, memberships, entitlements, assignments, auditEvents].find((result) => result.error);
    if (failure?.error) throw failure.error;
    return { roles: roles.data ?? [], permissions: permissions.data ?? [], companies: (companies.data ?? []).map((row) => ({ id: row.id, name: row.name, isActive: row.is_active })), memberships: (memberships.data ?? []).map((row) => ({ companyId: row.company_id, userId: row.user_id, isActive: row.is_active })), entitlements: (entitlements.data ?? []).map((row) => ({ companyId: row.company_id, moduleKey: row.module_key, enabled: row.enabled })), assignments: (assignments.data ?? []).map((row) => ({ companyId: row.company_id, userId: row.user_id, roleId: row.role_id })), auditEvents: (auditEvents.data ?? []).map((row) => ({ id: row.id, actorId: row.actor_id, companyId: row.company_id, eventType: row.event_type, outcome: row.outcome, target: row.target, createdAt: row.created_at })) };
  }
}
