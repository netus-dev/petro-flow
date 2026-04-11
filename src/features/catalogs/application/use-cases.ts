import { ICatalogsRepository } from "../domain/repository";
import { BaseCatalogItem, CatalogType } from "../domain/entities";

export class GetCatalogItemsUseCase {
  constructor(private repository: ICatalogsRepository) {}

  async execute(catalog: CatalogType, companyId?: string): Promise<BaseCatalogItem[]> {
    return this.repository.getItems(catalog, companyId);
  }
}

export class CreateCatalogItemUseCase {
  constructor(private repository: ICatalogsRepository) {}

  async execute(catalog: CatalogType, item: Partial<BaseCatalogItem>): Promise<BaseCatalogItem> {
    return this.repository.createItem(catalog, item);
  }
}

export class UpdateCatalogItemUseCase {
  constructor(private repository: ICatalogsRepository) {}

  async execute(catalog: CatalogType, id: string, item: Partial<BaseCatalogItem>): Promise<void> {
    return this.repository.updateItem(catalog, id, item);
  }
}

export class DeleteCatalogItemUseCase {
  constructor(private repository: ICatalogsRepository) {}

  async execute(catalog: CatalogType, id: string): Promise<void> {
    return this.repository.deleteItem(catalog, id);
  }
}
