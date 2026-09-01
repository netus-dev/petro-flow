"use server";

import { createTenantClient } from "@/src/core/lib/supabase/server";
import { SupabaseCatalogsRepository } from "../supabase-repository";
import { BaseCatalogItem } from "../../domain/entities";
import { isCatalog } from "./catalog-constants";

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
