import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { selectLoginCompany } from "../../application/select-login-company";
import { selectCompanyAfterLogin } from "./company-membership-actions";
import { expectedRequestOrigin, isSameRequestOrigin, shouldUseSecureCookie } from "./request-origin";

const mocks = vi.hoisted(() => ({
  cookieSet: vi.fn(),
  headers: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ set: mocks.cookieSet })),
  headers: mocks.headers,
}));

vi.mock("@/src/core/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ rpc: mocks.rpc })),
}));

beforeEach(() => {
  mocks.headers.mockResolvedValue(new Headers({
    origin: "https://evil.example",
    host: "petroflow.example.com",
    "x-forwarded-proto": "https",
  }));
  mocks.rpc.mockResolvedValue({ data: { company_id: "company-1" }, error: null });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("expectedRequestOrigin", () => {
  it("disables Secure only for explicit local HTTP requests", () => {
    expect(shouldUseSecureCookie("http://localhost:3000", "localhost:3000", null, false)).toBe(false);
    expect(shouldUseSecureCookie("http://127.0.0.1:3000", "127.0.0.1:3000", "http", false)).toBe(false);
    expect(shouldUseSecureCookie("http://[::1]:3000", "[::1]:3000", "http", false)).toBe(false);
  });

  it("keeps Secure for local HTTPS requests", () => {
    expect(shouldUseSecureCookie("https://localhost:3000", "localhost:3000", "https", false)).toBe(true);
  });

  it("keeps Secure for non-local HTTP requests", () => {
    expect(shouldUseSecureCookie("http://petroflow.example.com", "petroflow.example.com", "http", false)).toBe(true);
    expect(shouldUseSecureCookie("http://localhost.evil.example", "localhost.evil.example", "http", false)).toBe(true);
    expect(shouldUseSecureCookie("http://localhost:3000", "localhost:3000", null, true)).toBe(true);
  });

  it("keeps Secure when protocol information is missing, ambiguous, or unsupported", () => {
    expect(shouldUseSecureCookie(null, "localhost:3000", null, false)).toBe(true);
    expect(shouldUseSecureCookie("http://localhost:3000", null, null, false)).toBe(true);
    expect(shouldUseSecureCookie("http://localhost:3000", "localhost:3000", "http,https", false)).toBe(true);
    expect(shouldUseSecureCookie("http://localhost:3000", "localhost:3000", "ftp", false)).toBe(true);
  });

  it("keeps Secure for origins containing components that cannot belong to a Host header", () => {
    expect(shouldUseSecureCookie("http://user@localhost:3000", "user@localhost:3000", "http", false)).toBe(true);
    expect(shouldUseSecureCookie("http://localhost:3000/", "localhost:3000/", "http", false)).toBe(true);
    expect(shouldUseSecureCookie("http://localhost:3000/path", "localhost:3000/path", "http", false)).toBe(true);
    expect(shouldUseSecureCookie("http://localhost:3000?debug=1", "localhost:3000?debug=1", "http", false)).toBe(true);
    expect(shouldUseSecureCookie("http://localhost:3000#fragment", "localhost:3000#fragment", "http", false)).toBe(true);
  });

  it("allows local HTTP without forwarded protocol", () => {
    expect(expectedRequestOrigin("localhost:3000", null)).toBe("http://localhost:3000");
  });

  it("uses forwarded HTTPS in production", () => {
    expect(expectedRequestOrigin("petroflow.example.com", "https")).toBe("https://petroflow.example.com");
  });

  it("rejects unsupported forwarded protocols", () => {
    expect(expectedRequestOrigin("petroflow.example.com", "http")).toBe("http://petroflow.example.com");
    expect(expectedRequestOrigin("petroflow.example.com", "ftp")).toBeNull();
  });

  it("does not produce an origin for a missing host", () => {
    expect(expectedRequestOrigin(null, null)).toBeNull();
  });

  it("rejects a mismatched origin", () => {
    expect(isSameRequestOrigin("https://evil.example", "petroflow.example.com", "https")).toBe(false);
  });

  it("does not authorize navigation after a serializable context error", async () => {
    const result = await selectLoginCompany([{ companyId: "company-1", companyName: "Company" }], "", async () => ({
      status: "error" as const,
      message: "No se pudo establecer el contexto de compañía",
    }));

    expect(result).toBe(false);
  });

  it("rejects a Server Action before changing company context for a mismatched origin", async () => {
    await expect(selectCompanyAfterLogin("company-1")).resolves.toEqual({ status: "forbidden" });
  });

  it("writes a non-Secure company context cookie for local HTTP", async () => {
    mocks.headers.mockResolvedValue(new Headers({
      origin: "http://localhost:3000",
      host: "localhost:3000",
    }));
    vi.stubEnv("AUTHORIZATION_CONTEXT_SECRET", "test-secret");

    await expect(selectCompanyAfterLogin("company-1")).resolves.toEqual({ status: "ok" });
    expect(mocks.cookieSet).toHaveBeenCalledWith(
      "petro_company_context",
      expect.any(String),
      { httpOnly: true, secure: false, sameSite: "lax", path: "/" },
    );
  });
});
