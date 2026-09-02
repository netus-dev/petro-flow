import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const layoutPath = fileURLToPath(new URL("./layout.tsx", import.meta.url));

describe("authenticated layout authorization redirect", () => {
  it("uses the dashboard and never the removed company-selection route", () => {
    const source = readFileSync(layoutPath, "utf8");

    expect(source).toContain('redirect("/dashboard")');
    expect(source).not.toContain("/select-company");
  });
});
