import { create } from "zustand";
import { 
  FunctionalPrincipleCatalog, 
  AssetLocationStat 
} from "../../domain/entities";
import { trazabilidadRepository } from "../../infrastructure/repository";
import { 
  GetFunctionalPrinciplesUseCase, 
  GetAssetStatsUseCase 
} from "../../application/use-cases";

// Dependency Injection
const repository = trazabilidadRepository;
const getPrinciplesUseCase = new GetFunctionalPrinciplesUseCase(repository);
const getAssetStatsUseCase = new GetAssetStatsUseCase(repository);

interface TrazabilidadDashboardState {
  principles: FunctionalPrincipleCatalog[];
  selectedPrincipleId: string | null;
  stats: AssetLocationStat[];
  isLoading: boolean;
  isInitialLoading: boolean;
  error: string | null;

  // Actions
  fetchInitialData: () => Promise<void>;
  setSelectedPrinciple: (id: string) => Promise<void>;
  fetchStats: (id: string) => Promise<void>;
}

export const useTrazabilidadDashboardStore = create<TrazabilidadDashboardState>((set, get) => ({
  principles: [],
  selectedPrincipleId: null,
  stats: [],
  isLoading: false,
  isInitialLoading: false,
  error: null,

  fetchInitialData: async () => {
    set({ isInitialLoading: true, error: null });
    try {
      const principles = await getPrinciplesUseCase.execute();
      
      if (principles.length > 0) {
        const firstId = principles[0].id;
        set({ principles, selectedPrincipleId: firstId });
        // Fetch initial stats
        const stats = await getAssetStatsUseCase.execute(firstId);
        set({ stats, isInitialLoading: false });
      } else {
        set({ principles: [], selectedPrincipleId: null, stats: [], isInitialLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message || "Error al cargar datos iniciales", isInitialLoading: false });
    }
  },

  setSelectedPrinciple: async (id: string) => {
    if (get().selectedPrincipleId === id) return;
    set({ selectedPrincipleId: id });
    await get().fetchStats(id);
  },

  fetchStats: async (id: string) => {
    set({ isLoading: true });
    try {
      const stats = await getAssetStatsUseCase.execute(id);
      set({ stats, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Error al actualizar estadísticas", isLoading: false });
    }
  }
}));
