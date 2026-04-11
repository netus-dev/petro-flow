import { useState, useCallback, useMemo } from "react";
import { CatalogType, BaseCatalogItem } from "../../domain/entities";
import { catalogsRepository } from "../../infrastructure/repository";
import {
  GetCatalogItemsUseCase,
  CreateCatalogItemUseCase,
  UpdateCatalogItemUseCase,
  DeleteCatalogItemUseCase
} from "../../application/use-cases";

export function useCatalogs() {
  const [activeCatalog, setActiveCatalog] = useState<CatalogType>("locations");
  const [items, setItems] = useState<BaseCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Instanciar Use Cases (puede resolverse con inyección de dependencias más sofisticada, 
  // pero para este MVP los inyectamos directamente con el singleton).
  const getItemsUseCase = useMemo(() => new GetCatalogItemsUseCase(catalogsRepository), []);
  const createItemUseCase = useMemo(() => new CreateCatalogItemUseCase(catalogsRepository), []);
  const updateItemUseCase = useMemo(() => new UpdateCatalogItemUseCase(catalogsRepository), []);
  const deleteItemUseCase = useMemo(() => new DeleteCatalogItemUseCase(catalogsRepository), []);

  const loadItems = useCallback(async (catalog: CatalogType, companyId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getItemsUseCase.execute(catalog, companyId);
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar los catálogos");
    } finally {
      setLoading(false);
    }
  }, [getItemsUseCase]);

  const handleTabChange = (val: string) => {
    setActiveCatalog(val as CatalogType);
  };

  const createItem = async (payload: Partial<BaseCatalogItem>) => {
    setLoading(true);
    try {
      await createItemUseCase.execute(activeCatalog, payload);
      // Reload will be handled by the component or useEffect
    } catch (err: any) {
      setError(err.message || "Error al crear elemento");
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: string, payload: Partial<BaseCatalogItem>) => {
    setLoading(true);
    try {
      await updateItemUseCase.execute(activeCatalog, id, payload);
      // Reload will be handled by the component or useEffect
    } catch (err: any) {
      setError(err.message || "Error al actualizar elemento");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    setLoading(true);
    try {
      await deleteItemUseCase.execute(activeCatalog, id);
      // Reload will be handled by the component or useEffect
    } catch (err: any) {
      setError(err.message || "Error al eliminar elemento");
    } finally {
      setLoading(false);
    }
  };

  return {
    activeCatalog,
    items,
    loading,
    error,
    loadItems,
    handleTabChange,
    createItem,
    updateItem,
    deleteItem
  };
}
