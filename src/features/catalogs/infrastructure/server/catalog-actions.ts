"use server";

import { createTenantClient } from "@/src/core/lib/supabase/server";
import { CatalogType, BaseCatalogItem } from "../../domain/entities";
import { SupabaseCatalogsRepository } from "../supabase-repository";
import { CATALOG_TYPES, isCatalog } from "./catalog-constants";

type MutationResult = { ok: true; data?: BaseCatalogItem } | { ok: false; error: string };

function validatePayload(item: Partial<BaseCatalogItem>) {
  if (!item.name || typeof item.name !== "string" || item.name.trim().length === 0) {
    return "Name is required";
  }
  return null;
}

async function repository() {
  const client = await createTenantClient();
  return client ? new SupabaseCatalogsRepository(client) : null;
}

/** Creates a catalog item using tenant authority from the server context. */
export async function createCatalogItem(catalog: unknown, item: Partial<BaseCatalogItem>): Promise<MutationResult> {
  if (!isCatalog(catalog)) return { ok: false, error: "Invalid catalog" };
  const validationError = validatePayload(item);
  if (validationError) return { ok: false, error: validationError };
  const repo = await repository();
  if (!repo) return { ok: false, error: "Tenant context is unavailable" };
  try {
    const payload = { ...item };
    delete payload.company_id;
    return { ok: true, data: await repo.createItem(catalog, payload) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Create failed" };
  }
}

/** Updates a catalog item without accepting tenant identity from the browser. */
export async function updateCatalogItem(catalog: unknown, id: string, item: Partial<BaseCatalogItem>): Promise<MutationResult> {
  if (!isCatalog(catalog) || !id) return { ok: false, error: "Invalid catalog item" };
  const validationError = validatePayload(item);
  if (validationError) return { ok: false, error: validationError };
  const repo = await repository();
  if (!repo) return { ok: false, error: "Tenant context is unavailable" };
  try {
    const payload = { ...item };
    delete payload.company_id;
    await repo.updateItem(catalog, id, payload);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Update failed" };
  }
}

/** Deletes a catalog item using the validated tenant client. */
export async function deleteCatalogItem(catalog: unknown, id: string): Promise<MutationResult> {
  if (!isCatalog(catalog) || !id) return { ok: false, error: "Invalid catalog item" };
  const repo = await repository();
  if (!repo) return { ok: false, error: "Tenant context is unavailable" };
  try {
    await repo.deleteItem(catalog, id);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Delete failed" };
  }
}
