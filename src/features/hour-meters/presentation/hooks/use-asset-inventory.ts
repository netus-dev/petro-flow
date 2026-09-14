"use client";

import { useCallback, useEffect, useState } from "react";
import { FunctionalPrincipleInventoryItem } from "../../domain/entities";
import { GetFunctionalPrincipleInventoryUseCase, ManageInventoryUseCase, InventoryInput } from "../../application/usecases/inventory.usecases";
import { MockInventoryRepository } from "../../infrastructure/repositories/inventory.mock.repository";

const repository = new MockInventoryRepository();
const companyId = "mock-company";
const getFunctionalPrincipleInventory = new GetFunctionalPrincipleInventoryUseCase(repository);
const manageInventory = new ManageInventoryUseCase(repository);

/** Presentation adapter for loading shared inventory for one principle. */
export function useFunctionalPrincipleInventory(functionalPrincipleId: string | null) {
  const [items, setItems] = useState<FunctionalPrincipleInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!functionalPrincipleId) return;
    void Promise.resolve().then(() => setIsLoading(true));
    void getFunctionalPrincipleInventory.execute(companyId, functionalPrincipleId).then((result) => {
      if (result.isRight()) { setItems(result.value); setError(null); }
      else { setItems([]); setError(result.value.message); }
      setIsLoading(false);
    });
  }, [functionalPrincipleId]);

  return { items: functionalPrincipleId ? items : [], isLoading: functionalPrincipleId ? isLoading : false, error: functionalPrincipleId ? error : null };
}

export function useInventoryManagement(visiblePrincipleIds: readonly string[]) {
  const [items, setItems] = useState<FunctionalPrincipleInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const visiblePrincipleIdsKey = visiblePrincipleIds.join("\u0000");
  const refresh = useCallback(async () => { await Promise.resolve(); setIsLoading(true); const result = await manageInventory.list(companyId, visiblePrincipleIdsKey ? visiblePrincipleIdsKey.split("\u0000") : []); if (result.isRight()) { setItems(result.value); setError(null); } else setError(result.value.message); setIsLoading(false); }, [visiblePrincipleIdsKey]);
  useEffect(() => {
    let cancelled = false;
    void manageInventory.list(companyId, visiblePrincipleIdsKey ? visiblePrincipleIdsKey.split("\u0000") : []).then((result) => {
      if (cancelled) return;
      if (result.isRight()) { setItems(result.value); setError(null); }
      else setError(result.value.message);
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [visiblePrincipleIdsKey]);
  const save = useCallback(async (input: InventoryInput, id?: string) => { const result = id ? await manageInventory.update(companyId, id, input) : await manageInventory.create(companyId, input); if (result.isLeft()) return { error: result.value.message }; await refresh(); return {}; }, [refresh]);
  const remove = useCallback(async (id: string) => { const result = await manageInventory.deactivate(companyId, id); if (result.isLeft()) return { error: result.value.message }; await refresh(); return {}; }, [refresh]);
  return { items, isLoading, error, save, remove };
}
