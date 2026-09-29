import { Asset, Movement } from "../../domain/entities";

export const ASSET_FILTER_KEYS = ["search", "location", "status", "type", "ubication", "disabled"] as const;
export const MOVEMENT_FILTER_KEYS = ["search", "type"] as const;

export function parseAssetFilters(params: URLSearchParams) {
  return {
    search: params.get("search") ?? "",
    location: params.get("location") ?? "all",
    status: params.get("status") ?? "all",
    type: params.get("type") ?? "all",
    ubication: params.get("ubication") ?? "all",
    disabled: params.get("disabled") === "true",
  };
}

export function parseMovementFilters(params: URLSearchParams) {
  return { search: params.get("search") ?? "", type: params.get("type") ?? "all" };
}

export function serializeFilters(filters: Record<string, string | boolean>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== "all" && value !== false) params.set(key, String(value));
  });
  return params;
}

export function filterAssets(assets: Asset[], filters: ReturnType<typeof parseAssetFilters>) {
  const search = filters.search.toLowerCase();
  return assets.filter((asset) =>
    (asset.code?.toLowerCase().includes(search) || asset.serialNumber?.toLowerCase().includes(search) ||
      asset.name?.toLowerCase().includes(search) || asset.brand?.toLowerCase().includes(search) ||
      asset.model?.toLowerCase().includes(search) || asset.lastInspectionCode?.toLowerCase().includes(search)) &&
    (filters.location === "all" || asset.currentLocation === filters.location || asset.current_location_id === filters.location) &&
    (filters.status === "all" || asset.status === filters.status) &&
    (filters.type === "all" || asset.functionalPrinciple === filters.type || asset.function_principle_id === filters.type) &&
    (filters.ubication === "all" || asset.position === filters.ubication || asset.current_ubication_id === filters.ubication) &&
    (filters.disabled || asset.is_active !== false)
  );
}

export function filterMovements(movements: Movement[], filters: ReturnType<typeof parseMovementFilters>) {
  const search = filters.search.toLowerCase();
  return movements.filter((movement) =>
    (filters.type === "all" || movement.type === filters.type) &&
    [movement.originLocationName, movement.originUbicationName, movement.destinationLocationName,
      movement.destinationUbicationName, movement.justification, movement.type]
      .some((value) => value.toLowerCase().includes(search))
  );
}
