import { createClient } from "@/src/core/lib/supabase/client";
import { ICatalogsRepository } from "../domain/repository";
import { CatalogType, BaseCatalogItem } from "../domain/entities";

export class SupabaseCatalogsRepository implements ICatalogsRepository {
  private supabase = createClient();

  async getItems(catalog: CatalogType): Promise<BaseCatalogItem[]> {
    const { data, error } = await this.supabase
      .from(catalog)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching items from ${catalog}:`, error);
      throw new Error(error.message);
    }

    return data as BaseCatalogItem[];
  }

  async getItemById(catalog: CatalogType, id: string): Promise<BaseCatalogItem | undefined> {
    const { data, error } = await this.supabase
      .from(catalog)
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error(`Error fetching item ${id} from ${catalog}:`, error);
      return undefined;
    }

    return data as BaseCatalogItem;
  }

  async createItem(catalog: CatalogType, item: Partial<BaseCatalogItem>): Promise<BaseCatalogItem> {
    const { data, error } = await this.supabase
      .from(catalog)
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error(`Error creating item in ${catalog}:`, error);
      throw new Error(error.message);
    }

    return data as BaseCatalogItem;
  }

  async updateItem(catalog: CatalogType, id: string, item: Partial<BaseCatalogItem>): Promise<void> {
    // Remove id from payload if it exists
    const payload = { ...item };
    delete payload.id;
    delete payload.created_at;

    const { error } = await this.supabase
      .from(catalog)
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error(`Error updating item ${id} in ${catalog}:`, error);
      throw new Error(error.message);
    }
  }

  async deleteItem(catalog: CatalogType, id: string): Promise<void> {
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
