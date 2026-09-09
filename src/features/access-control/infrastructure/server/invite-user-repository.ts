import { createAdminClient } from "../../../../core/lib/supabase/admin";
import { createClient } from "../../../../core/lib/supabase/server";
import type { InviteUserInput } from "./invite-user-validation";

export type InviteUserFailure = "user_exists" | "auth_failure" | "provisioning_failure";

export class InviteUserError extends Error {
  constructor(public readonly code: InviteUserFailure, message: string) {
    super(message);
    this.name = "InviteUserError";
  }
}

interface AdminAuthClient { auth: { admin: { inviteUserByEmail(email: string, options?: { data?: Record<string, string> }): Promise<{ data: { user: { id: string } | null }; error: { code?: string; message: string } | null }>; deleteUser(userId: string): Promise<{ error: { message: string } | null }> } } }
interface ProvisioningClient { rpc(name: string, args: Record<string, string>): Promise<{ error: { message: string } | null }> }

/** Invites a user through Auth Admin and provisions its initial RBAC access. */
export async function inviteUserWithAccess(input: InviteUserInput, dependencies: { admin?: AdminAuthClient; client?: ProvisioningClient } = {}) {
  const admin = dependencies.admin ?? createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(input.email, { data: { full_name: input.fullName } });
  if (error) {
    const exists = error.code === "email_exists" || /already registered|already exists/i.test(error.message);
    throw new InviteUserError(exists ? "user_exists" : "auth_failure", exists ? "A user with this email already exists." : "User invitation failed.");
  }
  if (!data.user) throw new InviteUserError("auth_failure", "User invitation did not return a user.");

  const client = dependencies.client ?? await createClient();
  try {
    const provisioning = await client.rpc("rbac_provision_user_access", { p_user_id: data.user.id, p_role_id: input.roleId, p_company_id: input.companyId });
    if (provisioning.error) throw new Error(provisioning.error.message);
  } catch {
    try {
      await admin.auth.admin.deleteUser(data.user.id);
    } catch {
      // Keep the public error stable while preventing a partially provisioned user.
    }
    throw new InviteUserError("provisioning_failure", "User invitation succeeded, but access provisioning failed.");
  }
  return { userId: data.user.id, companyId: input.companyId, roleId: input.roleId };
}
