import { describe, expect, it, vi } from "vitest";
import { mapProjection } from "./domain/authorization";
import { readCompanyContext, sealCompanyContext } from "./infrastructure/server/company-context";
import { switchCompany } from "./application/switch-company";
import { createAuthorizationStore } from "./presentation/authorization-store";

const projection = { user_id: "u1", company_id: "b", roles: ["viewer"], capabilities: [{ action: "read", resource: "documents" }], enabled_modules: ["operations"] };

describe("browser authorization context", () => {
  it("seals a signed session cookie with secure HttpOnly options and rejects tampering", () => {
    const sealed = sealCompanyContext({ companyId: "a", contextId: "ctx", issuedAt: 1 }, "secret");
    expect(sealed.options).toEqual({ httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    expect(readCompanyContext(sealed.value, "secret")?.companyId).toBe("a");
    expect(readCompanyContext(`${sealed.value}x`, "secret")).toBeNull();
  });

  it("keeps the old context after an invalid or cross-origin switch", async () => {
    const write = vi.fn();
    const deps = { origin: "https://petro.test", project: vi.fn().mockResolvedValue(null), write, invalidate: vi.fn() };
    expect((await switchCompany("b", "https://evil.test", deps)).status).toBe("forbidden");
    expect((await switchCompany("b", "https://petro.test", deps)).status).toBe("forbidden");
    expect(write).not.toHaveBeenCalled();
  });

  it("maps scoped roles and replaces cached tenant state after a valid switch", async () => {
    const store = createAuthorizationStore();
    store.getState().hydrate(mapProjection({ ...projection, company_id: "a" }));
    const invalidate = vi.fn(() => store.getState().clear());
    const write = vi.fn();
    const result = await switchCompany("b", "https://petro.test", { origin: "https://petro.test", project: vi.fn().mockResolvedValue(projection), write, invalidate });
    expect(result).toEqual({ status: "ok", projection: mapProjection(projection) });
    expect(write).toHaveBeenCalledWith("b");
    expect(invalidate).toHaveBeenCalledOnce();
    expect(store.getState().projection).toBeNull();
  });
});
