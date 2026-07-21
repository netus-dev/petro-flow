import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import * as supabaseMiddleware from "@/src/core/lib/supabase/middleware";

vi.mock("@/src/core/lib/supabase/middleware", () => ({
  updateSession: vi.fn(),
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

  it("should redirect authenticated user away from public /auth/login to /dashboard", async () => {
    vi.mocked(supabaseMiddleware.updateSession).mockResolvedValueOnce({
      supabaseResponse: {} as any,
      user: { id: "user-123", email: "test@example.com" } as any,
    });

    const request = new NextRequest("http://localhost:3000/auth/login");
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
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
