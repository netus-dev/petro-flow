"use server";

import { can } from "../../../authorization/domain/authorization";
import { loadAuthorization } from "../../../authorization/infrastructure/server/authorization-session";
import { inviteUserWithAccess, InviteUserError } from "./invite-user-repository";
import { validateInviteUser } from "./invite-user-validation";

/** Authorizes, validates, invites, and provisions a user without exposing Admin credentials. */
export async function inviteUser(input: unknown) {
  const validated = validateInviteUser(input);
  if (!validated) return { ok: false as const, code: "invalid_input" as const, error: "Invalid user invitation input." };
  const authorization = await loadAuthorization();
  if (authorization.status !== "ok" || authorization.projection.activeCompanyId !== validated.companyId) {
    return { ok: false as const, code: "forbidden" as const, error: "A valid active company context is required." };
  }
  if (!can(authorization.projection, { action: "manage", resource: "access-control" })) {
    return { ok: false as const, code: "forbidden" as const, error: "Access-control administration is forbidden." };
  }
  try {
    return { ok: true as const, data: await inviteUserWithAccess(validated) };
  } catch (error) {
    if (error instanceof InviteUserError) return { ok: false as const, code: error.code, error: error.message };
    return { ok: false as const, code: "auth_failure" as const, error: "User invitation failed." };
  }
}
