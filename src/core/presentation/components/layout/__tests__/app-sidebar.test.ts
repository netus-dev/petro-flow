import { describe, expect, it } from "vitest";
import { filterNavigation } from "../app-sidebar-authorization";

const items = [
  { href: "/documents", moduleKey: "operations", capability: { action: "read", resource: "documents" } },
  { href: "/admin", moduleKey: "admin", capability: { action: "manage", resource: "roles" } },
];

describe("sidebar authorization", () => {
  it("does not render or activate unauthorized actions", () => {
    expect(filterNavigation(items, { enabledModules: ["operations"], capabilities: [{ action: "manage", resource: "roles" }] }, "/documents")).toEqual([]);
  });

  it("renders and activates only an enabled, capable module", () => {
    expect(filterNavigation(items, { enabledModules: ["operations"], capabilities: [{ action: "read", resource: "documents" }] }, "/documents")).toEqual([{ ...items[0], active: true }]);
  });

  it("allows access-control with its manage capability", () => {
    const item = { href: "/access-control", moduleKey: "access-control", capability: { action: "manage", resource: "access-control" } };
    expect(filterNavigation([item], { enabledModules: ["access-control"], capabilities: [item.capability] }, "/dashboard")).toEqual([{ ...item, active: false }]);
  });
});
