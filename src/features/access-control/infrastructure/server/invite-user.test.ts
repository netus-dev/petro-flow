import { describe, expect, it, vi } from "vitest";
import { inviteUserWithAccess } from "./invite-user-repository";
import { validateInviteUser } from "./invite-user-validation";

const input = { email: "new@example.com", fullName: "New User", companyId: "21000000-0000-0000-0000-000000000001", roleId: "31000000-0000-0000-0000-000000000001" };
const admin = (error: { code?: string; message: string } | null = null) => ({ auth: { admin: { inviteUserByEmail: vi.fn().mockResolvedValue({ data: { user: error ? null : { id: "user-id" } }, error }), deleteUser: vi.fn().mockResolvedValue({ error: null }) } } });
const client = (error: { message: string } | null = null) => ({ rpc: vi.fn().mockResolvedValue({ error }) });

describe("invite user onboarding", () => {
  it("validates email, name, company, and role", () => {
    expect(validateInviteUser(input)).toEqual(input);
    expect(validateInviteUser({ ...input, email: "bad" })).toBeNull();
    expect(validateInviteUser({ ...input, fullName: "" })).toBeNull();
  });

  it("keeps the invitation unconfirmed and provisions access", async () => {
    const auth = admin();
    const provisioning = client();
    const result = await inviteUserWithAccess(input, { admin: auth, client: provisioning });
    expect(auth.auth.admin.inviteUserByEmail).toHaveBeenCalledWith(input.email, { data: { full_name: input.fullName } });
    expect(provisioning.rpc).toHaveBeenCalledWith("rbac_provision_user_access", { p_user_id: "user-id", p_role_id: input.roleId, p_company_id: input.companyId });
    expect(result.userId).toBe("user-id");
  });

  it.each([
    [{ code: "email_exists", message: "User already registered" }, "user_exists"],
    [{ message: "network failure" }, "auth_failure"],
  ] as const)("maps Auth failure %s", async (error, code) => {
    await expect(inviteUserWithAccess(input, { admin: admin(error), client: client() })).rejects.toMatchObject({ code });
  });

  it("reports provisioning failure after the invitation", async () => {
    const auth = admin();
    await expect(inviteUserWithAccess(input, { admin: auth, client: client({ message: "forbidden" }) })).rejects.toMatchObject({ code: "provisioning_failure" });
    expect(auth.auth.admin.deleteUser).toHaveBeenCalledWith("user-id");
  });

  it("maps an RPC exception to provisioning failure and compensates the invitation", async () => {
    const auth = admin();
    const provisioning = { rpc: vi.fn().mockRejectedValue(new Error("timeout")) };
    await expect(inviteUserWithAccess(input, { admin: auth, client: provisioning })).rejects.toEqual(expect.objectContaining({ code: "provisioning_failure" }));
    expect(auth.auth.admin.deleteUser).toHaveBeenCalledWith("user-id");
  });
});
