import { z } from "zod";

const uuid = z.string().uuid();

const inviteUserSchema = z.object({
  email: z.string().trim().email().max(320),
  fullName: z.string().trim().min(1).max(200),
  companyId: uuid,
  roleId: uuid,
});

/** Validates the complete tenant-scoped onboarding command. */
export function validateInviteUser(input: unknown) {
  const result = inviteUserSchema.safeParse(input);
  return result.success ? result.data : null;
}

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
