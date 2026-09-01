"use server";

import { loadAuthorization } from "../../../authorization/infrastructure/server/authorization-session";
import { ExecuteAccessControlCommand, ReadAccessControlSnapshot } from "../../application/access-control-use-cases";
import type { AccessControlCommand } from "../../domain/access-control";
import { SupabaseAccessControlRepository } from "../supabase-access-control-repository";
import { validateAccessControlCommand } from "./access-control-command-validation";

/** Executes panel reads and writes through server-authoritative authorization. */
export async function readAccessControlSnapshot() {
  const result = await new ReadAccessControlSnapshot(new SupabaseAccessControlRepository(), async () => {
    const authorization = await loadAuthorization();
    return authorization.status === "ok" ? authorization.projection : null;
  }).execute();
  return result.isLeft() ? { ok: false as const, error: result.value.message } : { ok: true as const, data: result.value };
}
export async function runAccessControlCommand(command: AccessControlCommand) {
  const validated = validateAccessControlCommand(command);
  if (!validated) return { ok: false as const, error: "Invalid access-control command." };
  const result = await loadAuthorization();
  if (result.status !== "ok") return { ok: false as const, error: "A valid active company context is required." };
  const targetCompanyId = "companyId" in validated ? validated.companyId : "entitlement" in validated ? validated.entitlement.companyId : "membership" in validated ? validated.membership.companyId : "assignment" in validated ? validated.assignment.companyId : result.projection.activeCompanyId;
  if (targetCompanyId !== result.projection.activeCompanyId) return { ok: false as const, error: "Command company does not match the active tenant." };
  const execution = await new ExecuteAccessControlCommand(new SupabaseAccessControlRepository(), async () => result.projection).execute(validated);
  return execution.isLeft() ? { ok: false as const, error: execution.value.message } : { ok: true as const };
}
