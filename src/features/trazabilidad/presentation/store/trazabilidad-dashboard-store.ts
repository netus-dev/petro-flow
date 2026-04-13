import { create } from "zustand";
import { 
  FunctionalPrincipleCatalog, 
  AssetLocationStat,
  Asset
} from "../../domain/entities";
import { SupabaseTrazabilidadRepository } from "../../infrastructure/supabase-repository";
import { 
  GetFunctionalPrinciplesUseCase,
  GetAssetStatsUseCase,
  GetAssetsUnderInspectionUseCase
} from "../../application/use-cases";

// Dependency Injection
const repository = new SupabaseTrazabilidadRepository();
const getPrinciplesUseCase = new GetFunctionalPrinciplesUseCase(repository);
const getAssetStatsUseCase = new GetAssetStatsUseCase(repository);
const getAssetsUnderInspectionUseCase = new GetAssetsUnderInspectionUseCase(repository);

interface TrazabilidadDashboardState {
  principles: FunctionalPrincipleCatalog[];
  selectedPrincipleId: string | null;
  stats: AssetLocationStat[];
  assetsUnderInspection: Asset[];
  isLoading: boolean;
  isInitialLoading: boolean;
  isInspectionLoading: boolean;
  error: string | null;

  // Actions
  fetchInitialData: () => Promise<void>;
  setSelectedPrinciple: (id: string) => Promise<void>;
  fetchStats: (id: string) => Promise<void>;
  fetchAssetsUnderInspection: () => Promise<void>;
}

export const useTrazabilidadDashboardStore = create<TrazabilidadDashboardState>((set, get) => ({
  principles: [],
  selectedPrincipleId: null,
  stats: [],
  assetsUnderInspection: [],
  isLoading: false,
  isInitialLoading: false,
  isInspectionLoading: false,
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
  },

  fetchAssetsUnderInspection: async () => {
    set({ isInspectionLoading: true });
    try {
      const data = await getAssetsUnderInspectionUseCase.execute();
      set({ assetsUnderInspection: data, isInspectionLoading: false });
    } catch (err: any) {
      set({ error: err.message || "No se pudieron cargar los activos para inspección", isInspectionLoading: false });
    }
  }
}));
