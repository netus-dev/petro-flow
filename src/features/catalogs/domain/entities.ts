export interface Location {
  id: string;
  name: string;
  type: "rig" | "operating_base" | string;
  is_active: boolean;
  created_at?: string;
}

export interface Ubication {
  id: string;
  name: string;
  created_at?: string;
}

export interface FunctionalPrinciple {
  id: string;
  name: string;
  created_at?: string;
  [key: string]: any; // Para soportar property_1 al property_20
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export type CatalogType = "locations" | "ubications" | "functional_principles" | "companies";

// Generic Item Type for UI tables
export interface BaseCatalogItem {
  id: string;
  name: string;
  [key: string]: any;
}
