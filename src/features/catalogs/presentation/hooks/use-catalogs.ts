import { useState, useCallback } from "react";
import { CatalogType, BaseCatalogItem } from "../../domain/entities";
import { readCatalog } from "../../infrastructure/server/catalog-server";
import { createCatalogItem, updateCatalogItem, deleteCatalogItem } from "../../infrastructure/server/catalog-actions";

export function useCatalogs(initialItems: BaseCatalogItem[] = []) {
  const [activeCatalog, setActiveCatalog] = useState<CatalogType>("companies");
  const [items, setItems] = useState<BaseCatalogItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Instanciar Use Cases (puede resolverse con inyección de dependencias más sofisticada, 
  // pero para este MVP los inyectamos directamente con el singleton).
  const loadItems = useCallback(async (catalog: CatalogType): Promise<BaseCatalogItem[]> => {
    setLoading(true);
    setError(null);
    try {
      const result = await readCatalog(catalog);
      if (!result.ok) throw new Error(result.error);
      setItems(result.data);
      return result.data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar los catálogos");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTabChange = (val: string) => {
    setActiveCatalog(val as CatalogType);
  };

  const createItem = async (payload: Partial<BaseCatalogItem>) => {
    setLoading(true);
    try {
      const result = await createCatalogItem(activeCatalog, payload);
      if (!result.ok) throw new Error(result.error);
      // Reload will be handled by the component or useEffect
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear elemento");
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: string, payload: Partial<BaseCatalogItem>) => {
    setLoading(true);
    try {
      const result = await updateCatalogItem(activeCatalog, id, payload);
      if (!result.ok) throw new Error(result.error);
      // Reload will be handled by the component or useEffect
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar elemento");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    setLoading(true);
    try {
      const result = await deleteCatalogItem(activeCatalog, id);
      if (!result.ok) throw new Error(result.error);
      // Reload will be handled by the component or useEffect
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar elemento");
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
