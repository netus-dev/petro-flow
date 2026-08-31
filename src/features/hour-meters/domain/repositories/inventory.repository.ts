import { AssetInventoryItem } from "../entities";

/** Repository contract for inventory whose scope is explicit in every item. */
export interface IInventoryRepository {
  getByAssetId(assetId: string): Promise<AssetInventoryItem[]>;
  getAll(): Promise<AssetInventoryItem[]>;
  create(item: Omit<AssetInventoryItem, "id">): Promise<AssetInventoryItem>;
  update(id: string, item: Omit<AssetInventoryItem, "id">): Promise<AssetInventoryItem>;
  delete(id: string): Promise<void>;
}
