import { createTenantClient } from "../../../core/lib/supabase/server";
import type { AccessControlRepository, AuditEvent, ModuleEntitlement, Membership, Role, RoleAssignment, AccessControlSnapshot, Company } from "../domain/access-control";

const TENANT_CONTEXT_ERROR = "A valid active company context is required.";

/** Converts structured persistence failures into a safe domain-facing Error. */
function persistenceError(error: unknown, fallback: string): Error {
  if (error instanceof Error) return error;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    const message = error.message.replace(/\s+/g, " ").trim().slice(0, 200);
    if (message) return new Error(message);
  }
  return new Error(fallback);
}

/** Maps Supabase rows into domain objects and keeps all persistence outside the UI. */
export class SupabaseAccessControlRepository implements AccessControlRepository {
  private async client() {
    const client = await createTenantClient();
    if (!client) throw new Error(TENANT_CONTEXT_ERROR);
    return client;
  }
  async createRole(name: string, companyId: string): Promise<Role> { return this.command({ type: "create-role", companyId, role: { name } }) as Promise<Role>; }
  async updateRole(roleId: string, name: string, companyId: string) { await this.command({ type: "update-role", companyId, roleId, role: { name } }); }
  async deleteRole(roleId: string, companyId: string) { await this.command({ type: "delete-role", companyId, roleId }); }
  async createCompany(name: string): Promise<Company> { return this.command({ type: "create-company", company: { name } }) as Promise<Company>; }
  async updateCompany(companyId: string, name: string) { await this.command({ type: "update-company", companyId, company: { name } }); }
  async setCompany(companyId: string, isActive: boolean) { await this.command({ type: "set-company", companyId, isActive }); }
  async setUser(userId: string, isActive: boolean) { await this.command({ type: "set-user", userId, isActive }); }
  async setRolePermission(roleId: string, permissionId: string, enabled: boolean, companyId: string) { await this.command({ type: "set-permission", companyId, roleId, permissionId, enabled }); }
  private async command(command: Record<string, unknown>) { const { data, error } = await (await this.client()).rpc("rbac_admin_command", { p_command: command }); if (error) throw persistenceError(error, "Access-control operation failed."); return data; }
  async setEntitlement(value: ModuleEntitlement) { await this.command({ type: "set-entitlement", entitlement: value }); }
  async setMembership(value: Membership) { await this.command({ type: "set-membership", membership: value }); }
  async removeMembership(value: Pick<Membership, "companyId" | "userId">) { await this.command({ type: "remove-membership", membership: value }); }
  async setAssignment(value: RoleAssignment) { await this.command({ type: "set-assignment", assignment: value }); }
  async removeAssignment(value: RoleAssignment) { await this.command({ type: "remove-assignment", assignment: value }); }
  async listAuditEvents(companyId?: string): Promise<AuditEvent[]> { let query = (await this.client()).from("rbac_audit_events").select("id,actor_id,company_id,event_type,outcome,target,created_at").order("created_at", { ascending: false }); if (companyId) query = query.eq("company_id", companyId); const { data, error } = await query; if (error) throw persistenceError(error, "Authorization audit read failed."); return (data ?? []).map((row) => ({ id: row.id, actorId: row.actor_id, companyId: row.company_id, eventType: row.event_type, outcome: row.outcome, target: row.target, createdAt: row.created_at })); }
  async appendAuditEvent(event: Omit<AuditEvent, "id" | "createdAt">) { const { error } = await (await this.client()).rpc("rbac_record_audit", { p_company_id: event.companyId, p_event_type: event.eventType, p_outcome: event.outcome, p_target: event.target }); if (error) throw persistenceError(error, "Authorization audit write failed."); }
  async readSnapshot(): Promise<AccessControlSnapshot> {
    const { data, error } = await (await this.client()).rpc("rbac_admin_snapshot");
    if (error) throw persistenceError(error, "Access-control read failed.");
    return data;
  }
}
