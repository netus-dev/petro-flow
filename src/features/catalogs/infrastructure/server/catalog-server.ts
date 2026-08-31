"use server";

import { createTenantClient } from "@/src/core/lib/supabase/server";
import { SupabaseCatalogsRepository } from "../supabase-repository";
import { CatalogType, BaseCatalogItem } from "../../domain/entities";

export const CATALOG_TYPES: readonly CatalogType[] = ["locations", "ubications", "functional_principles", "companies", "suppliers", "wells", "brands", "models"];
const isCatalog = (value: unknown): value is CatalogType => typeof value === "string" && CATALOG_TYPES.includes(value as CatalogType);

export type CatalogResult =
  | { ok: true; data: BaseCatalogItem[] }
  | { ok: false; error: string };

/** Reads catalog data only through a validated server tenant context. */
export async function readCatalog(catalog: unknown): Promise<CatalogResult> {
  if (!isCatalog(catalog)) return { ok: false, error: "Invalid catalog" };
  const client = await createTenantClient();
  if (!client) return { ok: false, error: "Tenant context is unavailable" };

  try {
    const data = await new SupabaseCatalogsRepository(client).getItems(catalog);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Catalog read failed" };
  }
}
