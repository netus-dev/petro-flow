import type { SupabaseClient } from "@supabase/supabase-js";
import { ICatalogsRepository } from "../domain/repository";
import { CatalogType, BaseCatalogItem } from "../domain/entities";

export class SupabaseCatalogsRepository implements ICatalogsRepository {
  private supabase: SupabaseClient | null;

  constructor(supabase: SupabaseClient | null) {
    this.supabase = supabase;
  }

  async getItems(catalog: CatalogType, _companyId?: string): Promise<BaseCatalogItem[]> {
    if (!this.supabase) return [];
    // A browser-supplied companyId is not authority. Server clients inject the validated header.
    let query = this.supabase.from(catalog).select("*").order("created_at", { ascending: false });

    if (catalog === "locations") {
      query = this.supabase.from("locations").select("*, rigs(current_well_id), operating_bases(supplier_id)") as never;
    }

    // Apply company filter if provided and applicable
    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching items from ${catalog}:`, error);
      throw new Error(error.message);
    }

    if (catalog === "locations") {
      return data.map((d: Record<string, unknown>) => ({
        ...d,
        current_well_id: Array.isArray(d.rigs) ? (d.rigs[0] as Record<string, unknown>)?.current_well_id : (d.rigs as Record<string, unknown>)?.current_well_id,
        supplier_id: Array.isArray(d.operating_bases) ? (d.operating_bases[0] as Record<string, unknown>)?.supplier_id : (d.operating_bases as Record<string, unknown>)?.supplier_id,
      })) as unknown as BaseCatalogItem[];
    }

    return data as BaseCatalogItem[];
  }

  async getItemById(catalog: CatalogType, id: string): Promise<BaseCatalogItem | undefined> {
    if (!this.supabase) return undefined;
    let query = this.supabase.from(catalog).select("*").eq("id", id).single();

    if (catalog === "locations") {
      query = this.supabase.from("locations").select("*, rigs(current_well_id), operating_bases(supplier_id)").eq("id", id).single() as never;
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error(`Error fetching item ${id} from ${catalog}:`, error);
      return undefined;
    }

    if (catalog === "locations") {
      return {
        ...data,
        current_well_id: Array.isArray(data.rigs) ? data.rigs[0]?.current_well_id : data.rigs?.current_well_id,
        supplier_id: Array.isArray(data.operating_bases) ? data.operating_bases[0]?.supplier_id : data.operating_bases?.supplier_id,
      } as BaseCatalogItem;
    }

    return data as BaseCatalogItem;
  }

  async createItem(catalog: CatalogType, item: Partial<BaseCatalogItem>): Promise<BaseCatalogItem> {
    if (!this.supabase) throw new Error("Tenant context is unavailable");
    const payload = { ...item };
    const current_well_id = payload.current_well_id;
    const supplier_id = payload.supplier_id;
    delete payload.current_well_id;
    delete payload.supplier_id;

    const { data, error } = await this.supabase
      .from(catalog)
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error(`Error creating item in ${catalog}:`, error);
      throw new Error(error.message);
    }

    if (catalog === "locations" && data?.id) {
      if (payload.type === "rig") {
        await this.supabase.from("rigs").insert({ id: data.id, current_well_id: current_well_id || null });
      } else if (payload.type === "operating_base") {
        await this.supabase.from("operating_bases").insert({ id: data.id, supplier_id: supplier_id || null });
      }
    }

    return data as BaseCatalogItem;
  }

  async updateItem(catalog: CatalogType, id: string, item: Partial<BaseCatalogItem>): Promise<void> {
    if (!this.supabase) throw new Error("Tenant context is unavailable");
    // Remove id from payload if it exists
    const payload = { ...item };
    delete payload.id;
    delete payload.created_at;

    const current_well_id = payload.current_well_id;
    const supplier_id = payload.supplier_id;
    delete payload.current_well_id;
    delete payload.supplier_id;
    // Rigs and operating bases arrays fetched previously must not be updated into the locations table
    delete payload.rigs;
    delete payload.operating_bases;

    const { error } = await this.supabase
      .from(catalog)
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error(`Error updating item ${id} in ${catalog}:`, error);
      throw new Error(error.message);
    }

    if (catalog === "locations") {
      if (payload.type === "rig") {
        // Upsert uses location_id uniquely assuming it's a primary/unique key on the rigs table
        await this.supabase.from("rigs").upsert({ location_id: id, current_well_id: current_well_id || null }, { onConflict: "location_id" });
      } else if (payload.type === "operating_base") {
        await this.supabase.from("operating_bases").upsert({ location_id: id, supplier_id: supplier_id || null }, { onConflict: "location_id" });
      }
    }
  }

  async deleteItem(catalog: CatalogType, id: string): Promise<void> {
    if (!this.supabase) throw new Error("Tenant context is unavailable");
    const { error } = await this.supabase
      .from(catalog)
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting item ${id} from ${catalog}:`, error);
      throw new Error(error.message);
    }
  }
}
