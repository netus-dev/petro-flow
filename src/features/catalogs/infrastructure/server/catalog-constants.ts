import type { CatalogType } from "../../domain/entities";

export const CATALOG_TYPES: readonly CatalogType[] = ["locations", "ubications", "functional_principles", "companies", "suppliers", "wells", "brands", "models"];

export const isCatalog = (value: unknown): value is CatalogType => typeof value === "string" && CATALOG_TYPES.includes(value as CatalogType);
