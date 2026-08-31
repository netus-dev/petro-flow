import { describe, it, expect } from "vitest";
import { selectLoginCompany } from "../../../application/select-login-company";
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

  it("does not complete a single-company login before context selection", async () => {
    const selectionStarted = Promise.withResolvers<void>();
    let contextSelected = false;
    const selectCompany = async () => {
      selectionStarted.resolve();
      await new Promise((resolve) => setTimeout(resolve, 0));
      contextSelected = true;
      return { status: "ok" as const };
    };

    const flow = selectLoginCompany([memberships[0]], "", selectCompany);
    await selectionStarted.promise;
    expect(contextSelected).toBe(false);
    expect(await flow).toBe(true);
    expect(contextSelected).toBe(true);
  });

  it("completes context selection before allowing redirect", async () => {
    const events: string[] = [];
    const selected = await selectLoginCompany([memberships[0]], "", async () => {
      events.push("context-selected");
      return { status: "ok" as const };
    });

    if (selected) events.push("redirect");

    expect(selected).toBe(true);
    expect(events).toEqual(["context-selected", "redirect"]);
  });
});
