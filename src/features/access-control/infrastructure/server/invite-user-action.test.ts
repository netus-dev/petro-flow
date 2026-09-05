import { beforeEach, describe, expect, it, vi } from "vitest";

const { loadAuthorization, inviteUserWithAccess, InviteUserError } = vi.hoisted(() => ({
  loadAuthorization: vi.fn(),
  inviteUserWithAccess: vi.fn(),
  InviteUserError: class InviteUserError extends Error {},
}));

vi.mock("../../../authorization/infrastructure/server/authorization-session", () => ({ loadAuthorization }));
vi.mock("./invite-user-repository", () => ({ InviteUserError, inviteUserWithAccess: (...args: unknown[]) => inviteUserWithAccess(...args) }));

import { inviteUser } from "./invite-user-action";

const input = { email: "new@example.com", fullName: "New User", companyId: "21000000-0000-0000-0000-000000000001", roleId: "31000000-0000-0000-0000-000000000001" };

describe("invite user server action", () => {
  beforeEach(() => vi.resetAllMocks());

  it("rejects invalid input before authorization", async () => {
    await expect(inviteUser({ ...input, email: "invalid" })).resolves.toMatchObject({ ok: false, code: "invalid_input" });
    expect(loadAuthorization).not.toHaveBeenCalled();
  });

  it("requires the active tenant and manage/access-control capability", async () => {
    loadAuthorization.mockResolvedValue({ status: "ok", projection: { activeCompanyId: input.companyId, capabilities: [], enabledModules: [] } });
    await expect(inviteUser(input)).resolves.toMatchObject({ ok: false, code: "forbidden" });
    expect(inviteUserWithAccess).not.toHaveBeenCalled();
  });

  it("does not invoke Auth when the tenant differs", async () => {
    loadAuthorization.mockResolvedValue({ status: "ok", projection: { activeCompanyId: "41000000-0000-0000-0000-000000000001", capabilities: [{ action: "manage", resource: "access-control" }], enabledModules: [] } });
    await expect(inviteUser(input)).resolves.toMatchObject({ ok: false, code: "forbidden" });
    expect(inviteUserWithAccess).not.toHaveBeenCalled();
  });
});
