import { 
  AssetMovementPayload, 
  Asset, 
  TrazabilidadStats, 
  AssetCertificate,
  FunctionalPrincipleCatalog,
  AssetLocationStat,
  ReplacementMovementPayload
} from "./entities";

export interface ITrazabilidadRepository {
  getAssetList(): Promise<Asset[]>;
  getAssetById(id: string): Promise<Asset | undefined>;
  getAssetsUnderInspection(): Promise<Asset[]>;
  getDashboardStats(): Promise<TrazabilidadStats>;
  getFunctionalPrinciples(): Promise<FunctionalPrincipleCatalog[]>;
  getAssetStatsByFunctionalPrinciple(fpId: string): Promise<AssetLocationStat[]>;
  registerMovement(assetId: string, movement: any): Promise<void>;
  registerBulkMovement(payload: AssetMovementPayload): Promise<void>;
  registerReplacementMovement(payload: ReplacementMovementPayload): Promise<void>;
  addCertificate(
    assetId: string,
    certificates: { file: File; name: string }[],
  ): Promise<void>;
  registerAsset(asset: Partial<Asset>): Promise<void>;
  updateAsset(id: string, asset: Partial<Asset>): Promise<void>;
  disableAsset(id: string): Promise<void>;
}
