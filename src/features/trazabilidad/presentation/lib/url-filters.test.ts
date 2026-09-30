import { describe, expect, it } from "vitest";
import { filterAssets, parseAssetFilters, parseMovementFilters, serializeFilters } from "./url-filters";

describe("trazabilidad URL filters", () => {
  it("omits defaults and parses supported asset filters", () => {
    expect(serializeFilters({ search: "", location: "all", disabled: false, status: "active" }).toString()).toBe("status=active");
    expect(parseAssetFilters(new URLSearchParams("search=pump&disabled=true"))).toMatchObject({ search: "pump", disabled: true, location: "all" });
  });

  it("keeps asset filtering semantics, including disabled assets", () => {
    const assets = [
      { id: "1", code: "P-1", serialNumber: "S-1", name: "Pump", brand: "A", model: "M", status: "active", is_active: true } as any,
      { id: "2", code: "P-2", serialNumber: "S-2", name: "Pump", brand: "A", model: "M", status: "active", is_active: false } as any,
    ];
    expect(filterAssets(assets, parseAssetFilters(new URLSearchParams("search=p-2")))).toHaveLength(0);
    expect(filterAssets(assets, parseAssetFilters(new URLSearchParams("search=p-2&disabled=true")))).toHaveLength(1);
  });

  it("uses only movement list filters", () => {
    expect(parseMovementFilters(new URLSearchParams("type=transfer&search=origin"))).toEqual({ type: "transfer", search: "origin" });
  });
});
