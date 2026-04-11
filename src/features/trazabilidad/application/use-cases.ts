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

export class GetAssetsUnderInspectionUseCase {
  constructor(private repository: ITrazabilidadRepository) {}

  async execute(): Promise<Asset[]> {
    return this.repository.getAssetsUnderInspection();
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

export class AddCertificateUseCase {
  constructor(private repository: ITrazabilidadRepository) {}

  async execute(assetId: string, certificates: { file: File; name: string }[]): Promise<void> {
    return this.repository.addCertificate(assetId, certificates);
  }
}

export class RegisterAssetUseCase {
  constructor(private repository: ITrazabilidadRepository) {}

  async execute(asset: Partial<Asset>): Promise<void> {
    return this.repository.registerAsset(asset);
  }
}

export class EditAssetUseCase {
  constructor(private repository: ITrazabilidadRepository) {}

  async execute(id: string, asset: Partial<Asset>): Promise<void> {
    return this.repository.updateAsset(id, asset);
  }
}

export class DisableAssetUseCase {
  constructor(private repository: ITrazabilidadRepository) {}

  async execute(id: string): Promise<void> {
    return this.repository.disableAsset(id);
  }
}

export class RegisterBulkMovementUseCase {
  constructor(private repository: ITrazabilidadRepository) {}

  async execute(payload: any): Promise<void> {
    return this.repository.registerBulkMovement(payload);
  }
}

export class GetFunctionalPrinciplesUseCase {
  constructor(private repository: ITrazabilidadRepository) {}

  async execute() {
    return this.repository.getFunctionalPrinciples();
  }
}

export class GetAssetStatsUseCase {
  constructor(private repository: ITrazabilidadRepository) {}

  async execute(fpId: string) {
    return this.repository.getAssetStatsByFunctionalPrinciple(fpId);
  }
}

export class RegisterReplacementUseCase {
  constructor(private repository: ITrazabilidadRepository) {}

  async execute(payload: any): Promise<void> {
    return this.repository.registerReplacementMovement(payload);
  }
}
