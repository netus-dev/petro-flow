"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Asset } from "../../domain/entities";
import { AssetTable } from "./asset-table";
import { filterAssets, parseAssetFilters, serializeFilters } from "../lib/url-filters";
import { editTrazabilidadAsset, registerTrazabilidadAsset } from "../../infrastructure/server/trazabilidad-actions";
import { RegisterAssetModal } from "./register-asset-modal";

type AssetFilters = ReturnType<typeof parseAssetFilters>;

type AssetFilterKey = keyof AssetFilters;

export function TrazabilidadAssetsPage({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = parseAssetFilters(new URLSearchParams(params.toString()));

  /**
   * Updates asset filters in a single URL transition to avoid stale search params
   * when one UI action changes multiple dependent filters.
   */
  const updateFilters = (patch: Partial<AssetFilters>) => {
    const next = serializeFilters({ ...filters, ...patch });
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`);
  };

  /**
   * Updates a single asset filter while preserving type safety for filter keys.
   */
  const updateFilter = <K extends AssetFilterKey>(key: K, value: AssetFilters[K]) => {
    updateFilters({ [key]: value } as Pick<AssetFilters, K>);
  };

  return <div className="flex flex-col gap-4 p-6"><div className="flex justify-end"><RegisterAssetModal onRegister={async (asset) => { await registerTrazabilidadAsset(asset); router.refresh(); }} /></div><AssetTable assets={filterAssets(assets, filters)} allAssets={assets}
    onViewDetail={(asset) => router.push(`/trazabilidad/assets/${asset.id}`)}
    search={filters.search} setSearch={(v) => updateFilter("search", v)} locationFilter={filters.location} setLocationFilter={(v) => updateFilters({ location: v, type: "all", ubication: "all" })}
    statusFilter={filters.status} setStatusFilter={(v) => updateFilter("status", v)} typeFilter={filters.type} setTypeFilter={(v) => updateFilter("type", v)}
    ubicationFilter={filters.ubication} setUbicationFilter={(v) => updateFilter("ubication", v)} disabledFilter={filters.disabled} setDisabledFilter={(v) => updateFilter("disabled", v)}
    onEditAsset={async (id, asset) => { await editTrazabilidadAsset(id, asset); router.refresh(); }} /></div>;
}
