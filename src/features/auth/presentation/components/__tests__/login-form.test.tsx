import { describe, it, expect, vi } from "vitest";
import { resolveCompanySelection } from "../../../domain/entities/companyMembership";

describe("LoginForm Redirect Helper Logic", () => {
  const getValidRedirectPath = (redirectToParam: string | null): string => {
    if (
      redirectToParam &&
      redirectToParam.startsWith("/") &&
      !redirectToParam.startsWith("//") &&
      !redirectToParam.startsWith("/auth")
    ) {
      return redirectToParam;
    }
    return "/dashboard";
  };

  it("returns target path when valid relative path is provided", () => {
    expect(getValidRedirectPath("/requisitions")).toBe("/requisitions");
    expect(getValidRedirectPath("/timesheet/new")).toBe("/timesheet/new");
  });

  it("defaults to /dashboard when redirectTo is absent", () => {
    expect(getValidRedirectPath(null)).toBe("/dashboard");
    expect(getValidRedirectPath("")).toBe("/dashboard");
  });

  it("defaults to /dashboard when redirectTo points to /auth/* as safety fallback", () => {
    expect(getValidRedirectPath("/auth/login")).toBe("/dashboard");
    expect(getValidRedirectPath("/auth/register")).toBe("/dashboard");
  });

  it("defaults to /dashboard when redirectTo is an external URL or protocol-relative path", () => {
    expect(getValidRedirectPath("//malicious.com")).toBe("/dashboard");
  });
});

describe("company selection", () => {
  const memberships = [{ companyId: "a", companyName: "A" }, { companyId: "b", companyName: "B" }];

  it("selects the only active company automatically", () => {
    expect(resolveCompanySelection([memberships[0]])).toEqual({ status: "selected", companyId: "a" });
  });

  it("requires confirmation for multiple companies", () => {
    expect(resolveCompanySelection(memberships)).toEqual({ status: "selection_required" });
  });

  it("does not accept an unknown company", () => {
    expect(resolveCompanySelection(memberships, "unknown")).toEqual({ status: "selection_required" });
  });

  it("rejects users without active memberships", () => {
    expect(resolveCompanySelection([])).toEqual({ status: "invalid" });
  });
});
