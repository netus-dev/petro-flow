import { createTenantClient } from "../../../core/lib/supabase/server";
import type { AccessControlRepository, AuditEvent, ModuleEntitlement, Membership, Role, RoleAssignment, AccessControlSnapshot, Company } from "../domain/access-control";

/** Maps Supabase rows into domain objects and keeps all persistence outside the UI. */
export class SupabaseAccessControlRepository implements AccessControlRepository {
  private async client() {
    const client = await createTenantClient();
    if (!client) throw new Error("A valid active company membership is required.");
    return client;
  }
  async createRole(name: string, companyId?: string): Promise<Role> {
    if (!companyId) throw new Error("company_id is required to create a role.");
    throw new Error("Company-scoped roles are not supported by the current RBAC schema.");
  }
  async deleteRole() { throw new Error("Global role mutations are disabled."); }
  async createCompany(): Promise<Company> { throw new Error("Global company creation is disabled."); }
  async setCompany() { throw new Error("Global company mutations are disabled."); }
  async setRolePermission() { throw new Error("Global permission mutations are disabled."); }
  async setEntitlement(value: ModuleEntitlement) { const { error } = await (await this.client()).from("rbac_company_modules").upsert({ company_id: value.companyId, module_key: value.moduleKey, enabled: value.enabled }); if (error) throw error; }
  async setMembership(value: Membership) { const { error } = await (await this.client()).from("rbac_memberships").upsert({ company_id: value.companyId, user_id: value.userId, is_active: value.isActive }); if (error) throw error; }
  async setAssignment(value: RoleAssignment) { const { error } = await (await this.client()).from("rbac_assignments").upsert({ company_id: value.companyId, user_id: value.userId, role_id: value.roleId }); if (error) throw error; }
  async listAuditEvents(companyId?: string): Promise<AuditEvent[]> { let query = (await this.client()).from("rbac_audit_events").select("id,actor_id,company_id,event_type,outcome,target,created_at").order("created_at", { ascending: false }); if (companyId) query = query.eq("company_id", companyId); const { data, error } = await query; if (error) throw error; return (data ?? []).map((row) => ({ id: row.id, actorId: row.actor_id, companyId: row.company_id, eventType: row.event_type, outcome: row.outcome, target: row.target, createdAt: row.created_at })); }
  async appendAuditEvent(event: Omit<AuditEvent, "id" | "createdAt">) { const { error } = await (await this.client()).rpc("rbac_record_audit", { p_company_id: event.companyId, p_event_type: event.eventType, p_outcome: event.outcome, p_target: event.target }); if (error) throw error; }
  async readSnapshot(): Promise<AccessControlSnapshot> {
    const db = await this.client();
    const [roles, permissions, companies, memberships, entitlements, assignments, auditEvents] = await Promise.all([
      Promise.resolve({ data: [], error: null }), Promise.resolve({ data: [], error: null }),
      db.from("rbac_companies").select("id,name,is_active").eq("id", (await db.rpc("rbac_request_company_id")).data), db.from("rbac_memberships").select("company_id,user_id,is_active"),
      db.from("rbac_company_modules").select("company_id,module_key,enabled"), db.from("rbac_assignments").select("company_id,user_id,role_id"),
      db.from("rbac_audit_events").select("id,actor_id,company_id,event_type,outcome,target,created_at").order("created_at", { ascending: false }),
    ]);
    const failure = [roles, permissions, companies, memberships, entitlements, assignments, auditEvents].find((result) => result.error);
    if (failure?.error) throw failure.error;
    return { roles: roles.data ?? [], permissions: permissions.data ?? [], companies: (companies.data ?? []).map((row) => ({ id: row.id, name: row.name, isActive: row.is_active })), memberships: (memberships.data ?? []).map((row) => ({ companyId: row.company_id, userId: row.user_id, isActive: row.is_active })), entitlements: (entitlements.data ?? []).map((row) => ({ companyId: row.company_id, moduleKey: row.module_key, enabled: row.enabled })), assignments: (assignments.data ?? []).map((row) => ({ companyId: row.company_id, userId: row.user_id, roleId: row.role_id })), auditEvents: (auditEvents.data ?? []).map((row) => ({ id: row.id, actorId: row.actor_id, companyId: row.company_id, eventType: row.event_type, outcome: row.outcome, target: row.target, createdAt: row.created_at })) };
  }
}
