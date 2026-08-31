"use client";

import { useCallback, useEffect, useState } from "react";
import { AssetInventoryItem } from "../../domain/entities";
import { GetAssetInventoryUseCase, ManageInventoryUseCase, InventoryInput } from "../../application/usecases/inventory.usecases";
import { MockInventoryRepository } from "../../infrastructure/repositories/inventory.mock.repository";

const repository = new MockInventoryRepository();
const getAssetInventory = new GetAssetInventoryUseCase(repository);
const manageInventory = new ManageInventoryUseCase(repository);

/** Presentation adapter for loading inventory for the selected asset. */
export function useAssetInventory(assetId: string | null) {
  const [items, setItems] = useState<AssetInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assetId) { setItems([]); return; }
    setIsLoading(true);
    void getAssetInventory.execute(assetId).then((result) => {
      if (result.isRight()) { setItems(result.value); setError(null); }
      else { setItems([]); setError(result.value.message); }
      setIsLoading(false);
    });
  }, [assetId]);

  return { items, isLoading, error };
}

export function useInventoryManagement() {
  const [items, setItems] = useState<AssetInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => { setIsLoading(true); const result = await manageInventory.list(); if (result.isRight()) { setItems(result.value); setError(null); } else setError(result.value.message); setIsLoading(false); }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const save = useCallback(async (input: InventoryInput, id?: string) => { const result = id ? await manageInventory.update(id, input) : await manageInventory.create(input); if (result.isLeft()) return { error: result.value.message }; await refresh(); return {}; }, [refresh]);
  const remove = useCallback(async (id: string) => { const result = await manageInventory.delete(id); if (result.isLeft()) return { error: result.value.message }; await refresh(); return {}; }, [refresh]);
  return { items, isLoading, error, save, remove };
}
