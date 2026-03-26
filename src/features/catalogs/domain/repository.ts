import { BaseCatalogItem, CatalogType } from "./entities";

export interface ICatalogsRepository {
  /**
   * Obtiene todos los elementos de un catálogo específico.
   */
  getItems(catalog: CatalogType): Promise<BaseCatalogItem[]>;
  
  /**
   * Obtiene un elemento por ID.
   */
  getItemById(catalog: CatalogType, id: string): Promise<BaseCatalogItem | undefined>;
  
  /**
   * Crea un nuevo elemento en el catálogo.
   */
  createItem(catalog: CatalogType, item: Partial<BaseCatalogItem>): Promise<BaseCatalogItem>;
  
  /**
   * Actualiza un elemento existente.
   */
  updateItem(catalog: CatalogType, id: string, item: Partial<BaseCatalogItem>): Promise<void>;
  
  /**
   * Desactiva o elimina un elemento.
   */
  deleteItem(catalog: CatalogType, id: string): Promise<void>;
}
