import { describe, expect, it, vi } from "vitest";
import { requireCapability } from "./require-capability";

const requirement = { action: "read", resource: "documents", moduleKey: "operations" };
const projection = { userId: "u1", activeCompanyId: "a", roles: [], capabilities: [requirement], enabledModules: ["operations"] };

describe("requireCapability", () => {
  it("clears stale context and requires selection when context is missing or renewal fails", async () => {
    const clear = vi.fn();
    expect((await requireCapability(requirement, { context: async () => null, renew: vi.fn(), project: vi.fn(), clear })).status).toBe("context_required");
    expect((await requireCapability(requirement, { context: async () => ({ companyId: "a", contextId: "c", issuedAt: 1 }), renew: async () => false, project: vi.fn(), clear })).status).toBe("context_required");
    expect(clear).toHaveBeenCalledOnce();
  });

  it("returns 403 for a missing capability or disabled module and allows a complete projection", async () => {
    const base = { context: async () => ({ companyId: "a", contextId: "c", issuedAt: 1 }), renew: async () => true, clear: vi.fn() };
    expect((await requireCapability(requirement, { ...base, project: async () => ({ ...projection, capabilities: [] }) })).status).toBe("forbidden");
    expect((await requireCapability(requirement, { ...base, project: async () => ({ ...projection, enabledModules: [] }) })).status).toBe("forbidden");
    expect(await requireCapability(requirement, { ...base, project: async () => projection })).toEqual({ status: "ok", projection });
  });
});
