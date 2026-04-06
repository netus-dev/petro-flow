import { useEffect } from "react";
import { useTrazabilidadDashboardStore } from "../store/trazabilidad-dashboard-store";

export function useTrazabilidadDashboard() {
  const store = useTrazabilidadDashboardStore();

  useEffect(() => {
    // Only fetch initial data if principles haven't been loaded yet
    if (store.principles.length === 0 && !store.isInitialLoading) {
      store.fetchInitialData();
    }
  }, [store]);

  const handlePrincipleChange = (id: string) => {
    store.setSelectedPrinciple(id);
  };

  return {
    ...store,
    handlePrincipleChange
  };
}
