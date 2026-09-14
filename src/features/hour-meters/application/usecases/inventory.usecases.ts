import { Either, left, right } from "../../../../core/utils/either";
import { FunctionalPrincipleInventoryItem } from "../../domain/entities";
import {
  IInventoryRepository,
  InventoryWriteInput,
} from "../../domain/repositories/inventory.repository";

export type InventoryInput = InventoryWriteInput;

export interface InventoryFailure { message: string; }
export class InventoryRepositoryFailure implements InventoryFailure {
  constructor(public readonly message: string) {}
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/** Produces the material key shared by validation and persistence adapters. */
export function canonicalizeInventoryMaterial(material: string): string {
  return material.trim().replace(/[\t\n\v\f\r ]+/g, " ").toLowerCase();
}

/** Retrieves active inventory for a stable functional principle. */
export class GetFunctionalPrincipleInventoryUseCase {
  constructor(
    private readonly repository: Pick<
      IInventoryRepository,
      "getActiveByPrinciple"
    >,
  ) {}

  async execute(
    companyId: string,
    functionalPrincipleId?: string,
  ): Promise<Either<InventoryFailure, FunctionalPrincipleInventoryItem[]>> {
    if (!functionalPrincipleId?.trim()) {
      return left(
        new InventoryRepositoryFailure(
          "El principio funcional no está disponible.",
        ),
      );
    }
    try {
      return right(
        await this.repository.getActiveByPrinciple(
          companyId,
          functionalPrincipleId,
        ),
      );
    } catch (error: unknown) {
      return left(new InventoryRepositoryFailure(error instanceof Error ? error.message : "No fue posible cargar el inventario."));
    }
  }
}

function validate(input: InventoryInput): InventoryFailure | null {
  if (!input.material.trim() || !input.specification.trim()) return new InventoryRepositoryFailure("Material y especificación son obligatorios.");
  if (!Number.isInteger(input.quantityInStock) || input.quantityInStock < 0 || !Number.isInteger(input.minimumStock) || input.minimumStock < 0) return new InventoryRepositoryFailure("Las cantidades deben ser enteros iguales o mayores que cero.");
  if (!input.functionalPrincipleId.trim()) return new InventoryRepositoryFailure("Selecciona un principio funcional.");
  return null;
}

/** Lists and mutates inventory through the repository boundary. */
export class ManageInventoryUseCase {
  constructor(private readonly repository: IInventoryRepository) {}
  async list(companyId: string, visiblePrincipleIds: readonly string[]): Promise<Either<InventoryFailure, FunctionalPrincipleInventoryItem[]>> { try { return right(await this.repository.listActive(companyId, visiblePrincipleIds)); } catch (error: unknown) { return left(new InventoryRepositoryFailure(errorMessage(error, "No fue posible cargar el inventario."))); } }
  async create(companyId: string, input: InventoryInput): Promise<Either<InventoryFailure, FunctionalPrincipleInventoryItem>> { const failure = validate(input); if (failure) return left(failure); try { return right(await this.repository.create(companyId, input)); } catch (error: unknown) { return left(new InventoryRepositoryFailure(errorMessage(error, "No fue posible guardar el material."))); } }
  async update(companyId: string, id: string, input: InventoryInput): Promise<Either<InventoryFailure, FunctionalPrincipleInventoryItem>> { const failure = validate(input); if (failure) return left(failure); try { return right(await this.repository.update(companyId, id, input)); } catch (error: unknown) { return left(new InventoryRepositoryFailure(errorMessage(error, "No fue posible actualizar el material."))); } }
  async deactivate(companyId: string, id: string): Promise<Either<InventoryFailure, undefined>> { try { await this.repository.deactivate(companyId, id); return right(undefined); } catch (error: unknown) { return left(new InventoryRepositoryFailure(errorMessage(error, "No fue posible eliminar el material."))); } }
  async reactivate(companyId: string, id: string): Promise<Either<InventoryFailure, FunctionalPrincipleInventoryItem>> { try { return right(await this.repository.reactivate(companyId, id)); } catch (error: unknown) { return left(new InventoryRepositoryFailure(errorMessage(error, "No fue posible reactivar el material."))); } }
}
