import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  forbidden: vi.fn(),
  redirect: redirectMock,
}));

vi.mock("next/headers", () => ({ cookies: vi.fn(async () => ({ get: vi.fn() })) }));
vi.mock("../../../../core/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("./authorization-config", () => ({ getAuthorizationContextSecret: vi.fn(() => "secret") }));
vi.mock("./company-context", () => ({
  COMPANY_CONTEXT_COOKIE: "petro_company_context",
  readCompanyContext: vi.fn(() => null),
}));

describe("enforceCapability", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    redirectMock.mockImplementation((path: string) => {
      throw new Error(`redirect:${path}`);
    });
  });

  it("redirects to the dashboard when company context is required", async () => {
    const { enforceCapability } = await import("./authorization-session");

    await expect(enforceCapability({ action: "read", resource: "documents" })).rejects.toThrow("redirect:/dashboard");

    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
    expect(redirectMock).not.toHaveBeenCalledWith("/select-company");
  });
});
