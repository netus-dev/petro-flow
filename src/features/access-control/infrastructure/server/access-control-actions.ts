"use server";

import { loadAuthorization } from "../../../authorization/infrastructure/server/authorization-session";
import { left } from "../../../../core/utils/either";
import { ExecuteAccessControlCommand, ReadAccessControlSnapshot } from "../../application/access-control-use-cases";
import type { AccessControlCommand } from "../../domain/access-control";
import { SupabaseAccessControlRepository } from "../supabase-access-control-repository";
import { z } from "zod";

const uuid = z.string().uuid();
const commandSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("create-role"), companyId: uuid, role: z.object({ name: z.string().trim().min(1).max(100) }) }),
  z.object({ type: z.literal("delete-role"), companyId: uuid, roleId: uuid }),
  z.object({ type: z.literal("create-company"), company: z.object({ name: z.string().trim().min(1).max(100) }) }),
  z.object({ type: z.literal("set-company"), companyId: uuid, isActive: z.boolean() }),
  z.object({ type: z.literal("set-permission"), companyId: uuid, roleId: uuid, permissionId: uuid, enabled: z.boolean() }),
  z.object({ type: z.literal("set-entitlement"), entitlement: z.object({ companyId: uuid, moduleKey: z.string().trim().min(1).max(100), enabled: z.boolean() }) }),
  z.object({ type: z.literal("set-membership"), membership: z.object({ companyId: uuid, userId: uuid, isActive: z.boolean() }) }),
  z.object({ type: z.literal("set-assignment"), assignment: z.object({ companyId: uuid, userId: uuid, roleId: uuid }) }),
]);

export function validateAccessControlCommand(input: unknown): AccessControlCommand | null {
  const parsed = commandSchema.safeParse(input);
  return parsed.success ? parsed.data : null;
}

/** Executes panel reads and writes through server-authoritative authorization. */
export async function readAccessControlSnapshot() { return new ReadAccessControlSnapshot(new SupabaseAccessControlRepository(), async () => { const result = await loadAuthorization(); return result.status === "ok" ? result.projection : null; }).execute(); }
export async function runAccessControlCommand(command: AccessControlCommand) {
  const validated = validateAccessControlCommand(command);
  if (!validated) return left({ code: "forbidden" as const, message: "Invalid access-control command." });
  const result = await loadAuthorization();
  if (result.status !== "ok") return left({ code: "forbidden" as const, message: "A valid active company context is required." });
  const targetCompanyId = "companyId" in validated ? validated.companyId : "entitlement" in validated ? validated.entitlement.companyId : "membership" in validated ? validated.membership.companyId : "assignment" in validated ? validated.assignment.companyId : result.projection.activeCompanyId;
  if (targetCompanyId !== result.projection.activeCompanyId) return left({ code: "forbidden" as const, message: "Command company does not match the active tenant." });
  return new ExecuteAccessControlCommand(new SupabaseAccessControlRepository(), async () => result.projection).execute(validated);
}
