import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import * as supabaseMiddleware from "@/src/core/lib/supabase/middleware";

vi.mock("@/src/core/lib/supabase/middleware", () => ({
  updateSession: vi.fn(),
}));

vi.mock("@/src/features/authorization/infrastructure/server/company-context", () => ({
  COMPANY_CONTEXT_COOKIE: "petro_company_context",
  readCompanyContext: vi.fn(() => null),
}));

describe("Middleware Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect unauthenticated user from protected route to /auth/login with redirectTo query param", async () => {
    vi.mocked(supabaseMiddleware.updateSession).mockResolvedValueOnce({
      supabaseResponse: {} as any,
      user: null,
    });

    const request = new NextRequest("http://localhost:3000/requisitions");
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/login?redirectTo=%2Frequisitions"
    );
  });

  it("should allow authenticated user to open /auth/login", async () => {
    const mockResponse = { headers: new Headers() } as any;
    vi.mocked(supabaseMiddleware.updateSession).mockResolvedValueOnce({
      supabaseResponse: mockResponse,
      user: { id: "user-123", email: "test@example.com" } as any,
    });

    const request = new NextRequest("http://localhost:3000/auth/login");
    const response = await proxy(request);

    expect(response).toBe(mockResponse);
  });

  it("should redirect authenticated user with a valid company context away from auth routes", async () => {
    const mockResponse = { headers: new Headers() } as any;
    const { readCompanyContext } = await import(
      "@/src/features/authorization/infrastructure/server/company-context"
    );
    vi.mocked(readCompanyContext).mockReturnValue({
      companyId: "company-123",
      contextId: "context-123",
      issuedAt: Date.now(),
    });
    vi.mocked(supabaseMiddleware.updateSession).mockResolvedValueOnce({
      supabaseResponse: mockResponse,
      user: { id: "user-123", email: "test@example.com" } as any,
    });

    const request = new NextRequest("http://localhost:3000/auth/login");
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("should allow authenticated Server Actions on /auth/login", async () => {
    const mockResponse = { headers: new Headers() } as any;
    vi.mocked(supabaseMiddleware.updateSession).mockResolvedValueOnce({
      supabaseResponse: mockResponse,
      user: { id: "user-123", email: "test@example.com" } as any,
    });

    const request = new NextRequest("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "next-action": "login-action" },
    });
    const response = await proxy(request);

    expect(response).toBe(mockResponse);
  });

  it("should allow authenticated user to pass through to protected route", async () => {
    const mockResponse = { headers: new Headers() } as any;
    vi.mocked(supabaseMiddleware.updateSession).mockResolvedValueOnce({
      supabaseResponse: mockResponse,
      user: { id: "user-123", email: "test@example.com" } as any,
    });

    const request = new NextRequest("http://localhost:3000/timesheet");
    const response = await proxy(request);

    expect(response).toBe(mockResponse);
  });

  it("should redirect expired session (user === null) to login", async () => {
    vi.mocked(supabaseMiddleware.updateSession).mockResolvedValueOnce({
      supabaseResponse: {} as any,
      user: null,
    });

    const request = new NextRequest("http://localhost:3000/hour-meters");
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/auth/login?redirectTo=%2Fhour-meters");
  });
});
