import { Either, left, right } from "../../../../core/utils/either";
import { AssetInventoryItem } from "../../domain/entities";
import { IInventoryRepository } from "../../domain/repositories/inventory.repository";

export type InventoryInput = Omit<AssetInventoryItem, "id">;

export interface InventoryFailure { message: string; }
export class InventoryRepositoryFailure implements InventoryFailure {
  constructor(public readonly message: string) {}
}

/** Retrieves inventory assigned to the selected asset. */
export class GetAssetInventoryUseCase {
  constructor(private readonly repository: Pick<IInventoryRepository, "getByAssetId">) {}

  async execute(assetId: string): Promise<Either<InventoryFailure, AssetInventoryItem[]>> {
    if (!assetId.trim()) return left(new InventoryRepositoryFailure("Selecciona un activo válido."));
    try {
      return right(await this.repository.getByAssetId(assetId));
    } catch (error: unknown) {
      return left(new InventoryRepositoryFailure(error instanceof Error ? error.message : "No fue posible cargar el inventario."));
    }
  }
}

function validate(input: InventoryInput): InventoryFailure | null {
  if (!input.material.trim() || !input.specification.trim()) return new InventoryRepositoryFailure("Material y especificación son obligatorios.");
  if (!Number.isInteger(input.quantityInStock) || input.quantityInStock < 0 || !Number.isInteger(input.minimumStock) || input.minimumStock < 0) return new InventoryRepositoryFailure("Las cantidades deben ser enteros iguales o mayores que cero.");
  if (input.scope === "asset" && !input.assetId) return new InventoryRepositoryFailure("Selecciona un activo.");
  if (input.scope === "shared_equipment_type" && !input.equipmentType) return new InventoryRepositoryFailure("Selecciona un tipo de equipo.");
  return null;
}

/** Lists and mutates inventory through the repository boundary. */
export class ManageInventoryUseCase {
  constructor(private readonly repository: IInventoryRepository) {}
  async list(): Promise<Either<InventoryFailure, AssetInventoryItem[]>> { try { return right(await this.repository.getAll()); } catch (error: any) { return left(new InventoryRepositoryFailure(error?.message ?? "No fue posible cargar el inventario.")); } }
  async create(input: InventoryInput): Promise<Either<InventoryFailure, AssetInventoryItem>> { const failure = validate(input); if (failure) return left(failure); try { return right(await this.repository.create(input)); } catch (error: any) { return left(new InventoryRepositoryFailure(error?.message ?? "No fue posible guardar el material.")); } }
  async update(id: string, input: InventoryInput): Promise<Either<InventoryFailure, AssetInventoryItem>> { const failure = validate(input); if (failure) return left(failure); try { return right(await this.repository.update(id, input)); } catch (error: any) { return left(new InventoryRepositoryFailure(error?.message ?? "No fue posible actualizar el material.")); } }
  async delete(id: string): Promise<Either<InventoryFailure, undefined>> { try { await this.repository.delete(id); return right(undefined); } catch (error: any) { return left(new InventoryRepositoryFailure(error?.message ?? "No fue posible eliminar el material.")); } }
}
