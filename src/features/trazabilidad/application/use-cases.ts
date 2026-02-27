import { ITrazabilidadRepository } from "../domain/repository";
import { Asset, TrazabilidadStats } from "../domain/entities";

export class GetAssetListUseCase {
  constructor(private repository: ITrazabilidadRepository) {}

  async execute(): Promise<Asset[]> {
    return this.repository.getAssetList();
  }
}

export class GetAssetByIdUseCase {
  constructor(private repository: ITrazabilidadRepository) {}

  async execute(id: string): Promise<Asset | undefined> {
    return this.repository.getAssetById(id);
  }
}

export class GetDashboardStatsUseCase {
  constructor(private repository: ITrazabilidadRepository) {}

  async execute(): Promise<TrazabilidadStats> {
    return this.repository.getDashboardStats();
  }
}

export class RegisterMovementUseCase {
  constructor(private repository: ITrazabilidadRepository) {}

  async execute(assetId: string, movement: any): Promise<void> {
    return this.repository.registerMovement(assetId, movement);
  }
}
