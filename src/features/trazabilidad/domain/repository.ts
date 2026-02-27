import { Asset, TrazabilidadStats } from "./entities";

export interface ITrazabilidadRepository {
  getAssetList(): Promise<Asset[]>;
  getAssetById(id: string): Promise<Asset | undefined>;
  getDashboardStats(): Promise<TrazabilidadStats>;
  registerMovement(assetId: string, movement: any): Promise<void>;
}
