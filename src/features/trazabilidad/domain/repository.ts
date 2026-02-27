import { Asset, TrazabilidadStats, AssetCertificate } from "./entities";

export interface ITrazabilidadRepository {
  getAssetList(): Promise<Asset[]>;
  getAssetById(id: string): Promise<Asset | undefined>;
  getDashboardStats(): Promise<TrazabilidadStats>;
  registerMovement(assetId: string, movement: any): Promise<void>;
  addCertificate(
    assetId: string,
    certificate: Partial<AssetCertificate>,
  ): Promise<void>;
  registerAsset(asset: Partial<Asset>): Promise<void>;
}
