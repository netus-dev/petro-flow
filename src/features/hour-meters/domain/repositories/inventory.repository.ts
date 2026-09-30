import { FunctionalPrincipleInventoryItem } from "../entities";

export type InventoryWriteInput = Pick<
  FunctionalPrincipleInventoryItem,
  | "functionalPrincipleId"
  | "material"
  | "specification"
  | "quantityInStock"
  | "minimumStock"
>;

/** Company-scoped persistence contract for shared functional-principle stock. */
export interface IInventoryRepository {
  listActive(
    companyId: string,
    visiblePrincipleIds: readonly string[],
  ): Promise<FunctionalPrincipleInventoryItem[]>;
  getActiveByPrinciple(
    companyId: string,
    functionalPrincipleId: string,
  ): Promise<FunctionalPrincipleInventoryItem[]>;
  create(
    companyId: string,
    item: InventoryWriteInput,
  ): Promise<FunctionalPrincipleInventoryItem>;
  update(
    companyId: string,
    id: string,
    item: InventoryWriteInput,
  ): Promise<FunctionalPrincipleInventoryItem>;
  deactivate(companyId: string, id: string): Promise<void>;
  reactivate(
    companyId: string,
    id: string,
  ): Promise<FunctionalPrincipleInventoryItem>;
}
