import { z } from "zod";
import type { AccessControlCommand } from "../../domain/access-control";

const uuid = z.string().uuid();

const commandSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("create-role"), companyId: uuid, role: z.object({ name: z.string().trim().min(1).max(100) }) }),
  z.object({ type: z.literal("update-role"), companyId: uuid, roleId: uuid, role: z.object({ name: z.string().trim().min(1).max(100) }) }),
  z.object({ type: z.literal("delete-role"), companyId: uuid, roleId: uuid }),
  z.object({ type: z.literal("create-company"), company: z.object({ name: z.string().trim().min(1).max(100) }) }),
  z.object({ type: z.literal("update-company"), companyId: uuid, company: z.object({ name: z.string().trim().min(1).max(100) }) }),
  z.object({ type: z.literal("set-company"), companyId: uuid, isActive: z.boolean() }),
  z.object({ type: z.literal("set-user"), userId: uuid, isActive: z.boolean() }),
  z.object({ type: z.literal("set-permission"), companyId: uuid, roleId: uuid, permissionId: uuid, enabled: z.boolean() }),
  z.object({ type: z.literal("set-entitlement"), entitlement: z.object({ companyId: uuid, moduleKey: z.string().trim().min(1).max(100), enabled: z.boolean() }) }),
  z.object({ type: z.literal("set-membership"), membership: z.object({ companyId: uuid, userId: uuid, isActive: z.boolean() }) }),
  z.object({ type: z.literal("remove-membership"), membership: z.object({ companyId: uuid, userId: uuid }) }),
  z.object({ type: z.literal("set-assignment"), assignment: z.object({ companyId: uuid, userId: uuid, roleId: uuid }) }),
  z.object({ type: z.literal("remove-assignment"), assignment: z.object({ companyId: uuid, userId: uuid, roleId: uuid }) }),
  z.object({ type: z.literal("set-operational-scope"), scope: z.object({ companyId: uuid, userId: uuid, mode: z.enum(["specific_rig", "all_rigs"]), rigIds: z.array(uuid).max(500) }).superRefine((value, ctx) => { if (value.mode === "specific_rig" && value.rigIds.length === 0) ctx.addIssue({ code: "custom", message: "specific_rig requires rigs" }); if (value.mode === "all_rigs" && value.rigIds.length) ctx.addIssue({ code: "custom", message: "all_rigs cannot list rigs" }); }) }),
  z.object({ type: z.literal("remove-operational-scope"), companyId: uuid, userId: uuid }),
]);

/** Validates an access-control command before it reaches the server action. */
export function validateAccessControlCommand(input: unknown): AccessControlCommand | null {
  const parsed = commandSchema.safeParse(input);
  return parsed.success ? parsed.data : null;
}
