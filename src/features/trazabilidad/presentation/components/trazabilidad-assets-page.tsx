"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Asset } from "../../domain/entities";
import { AssetTable } from "./asset-table";
import { filterAssets, parseAssetFilters, serializeFilters } from "../lib/url-filters";
import { editTrazabilidadAsset, registerTrazabilidadAsset } from "../../infrastructure/server/trazabilidad-actions";
import { RegisterAssetModal } from "./register-asset-modal";

export function TrazabilidadAssetsPage({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = parseAssetFilters(new URLSearchParams(params.toString()));
  const update = (key: string, value: string | boolean) => {
    const next = serializeFilters({ ...filters, [key]: value });
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`);
  };
  return <div className="flex flex-col gap-4 p-6"><div className="flex justify-end"><RegisterAssetModal onRegister={async (asset) => { await registerTrazabilidadAsset(asset); router.refresh(); }} /></div><AssetTable assets={filterAssets(assets, filters)} allAssets={assets}
    onViewDetail={(asset) => router.push(`/trazabilidad/assets/${asset.id}`)}
    search={filters.search} setSearch={(v) => update("search", v)} locationFilter={filters.location} setLocationFilter={(v) => update("location", v)}
    statusFilter={filters.status} setStatusFilter={(v) => update("status", v)} typeFilter={filters.type} setTypeFilter={(v) => update("type", v)}
    ubicationFilter={filters.ubication} setUbicationFilter={(v) => update("ubication", v)} disabledFilter={filters.disabled} setDisabledFilter={(v) => update("disabled", v)}
    onEditAsset={async (id, asset) => { await editTrazabilidadAsset(id, asset); router.refresh(); }} /></div>;
}
