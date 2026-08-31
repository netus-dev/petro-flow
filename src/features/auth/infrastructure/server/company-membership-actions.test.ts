import { describe, expect, it, vi } from "vitest";
import { selectLoginCompany } from "../../application/select-login-company";
import { selectCompanyAfterLogin } from "./company-membership-actions";
import { expectedRequestOrigin, isSameRequestOrigin } from "./request-origin";

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers({
    origin: "https://evil.example",
    host: "petroflow.example.com",
    "x-forwarded-proto": "https",
  })),
}));

describe("expectedRequestOrigin", () => {
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
});
