import { useState, useEffect, useMemo, useCallback } from "react";
import { AssetMovementPayload, Asset, TrazabilidadStats, Movement } from "../../domain/entities";
import {
  addTrazabilidadCertificates, disableTrazabilidadAsset, editTrazabilidadAsset,
  getTrazabilidadAsset, registerTrazabilidadAsset,
  getTrazabilidadAssets, getTrazabilidadDashboardStats, getTrazabilidadMovements, getTrazabilidadMovement,
  registerTrazabilidadBulkMovement, registerTrazabilidadMovement,
  registerTrazabilidadReplacement,
} from "../../infrastructure/server/trazabilidad-actions";

export type TrazabilidadView = "dashboard" | "list" | "detail" | "movement_list" | "movement_detail";

export function useTrazabilidad() {
  const [view, setView] = useState<TrazabilidadView>("dashboard");
  const [assetList, setAssetList] = useState<Asset[]>([]);
  const [stats, setStats] = useState<TrazabilidadStats | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [movementList, setMovementList] = useState<Movement[]>([]);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [loadingView, setLoadingView] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterUbication, setFilterUbication] = useState<string>("all");
  const [filterDisabled, setFilterDisabled] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoadingView(true);
    setError(null);
    try {
      if (view === "dashboard") setStats(await getTrazabilidadDashboardStats());
      if (view === "list") setAssetList(await getTrazabilidadAssets());
      if (view === "movement_list") setMovementList(await getTrazabilidadMovements());
    } catch (error) {
      console.error("Error fetching trazabilidad data:", error);
      setError(error instanceof Error ? error.message : "No se pudo cargar la información");
    } finally {
      setLoadingView(false);
    }
  }, [view]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredAssets = useMemo(() => {
    return assetList.filter((asset) => {
      const s = search.toLowerCase();
      const matchesSearch =
        asset.code?.toLowerCase().includes(s) ||
        asset.serialNumber?.toLowerCase().includes(s) ||
        asset.name?.toLowerCase().includes(s) ||
        asset.brand?.toLowerCase().includes(s) ||
        asset.model?.toLowerCase().includes(s) ||
        (asset.lastInspectionCode && asset.lastInspectionCode.toLowerCase().includes(s));

      const matchesLocation =
        filterLocation === "all" || asset.currentLocation === filterLocation || asset.current_location_id === filterLocation;
      const matchesStatus =
        filterStatus === "all" || asset.status === filterStatus;
      const matchesType =
        filterType === "all" || asset.functionalPrinciple === filterType || asset.function_principle_id === filterType;
      const matchesUbication =
        filterUbication === "all" || asset.position === filterUbication || asset.current_ubication_id === filterUbication;
      const matchesDisabled = filterDisabled ? true : asset.is_active !== false;

      return matchesSearch && matchesLocation && matchesStatus && matchesType && matchesUbication && matchesDisabled;
    });
  }, [assetList, search, filterLocation, filterStatus, filterType, filterUbication, filterDisabled]);

  const handleRegisterMovement = async (assetId: string, movement: any) => {
    await registerTrazabilidadMovement(assetId, movement);
    await fetchData(); // Refresh the active view only
    if (selectedAsset?.id === assetId) {
      const updated = await getTrazabilidadAsset(assetId);
      if (updated) setSelectedAsset(updated);
    }
  };

  const handleRegisterBulkMovement = async (payload: AssetMovementPayload) => {
    await registerTrazabilidadBulkMovement(payload);
    await fetchData();
  };

  const handleRegisterReplacementMovement = async (payload: any) => {
    await registerTrazabilidadReplacement(payload);
    await fetchData();
  };

  const handleAddCertificate = async (assetId: string, certificates: { file: File; name: string }[]) => {
    await addTrazabilidadCertificates(assetId, certificates);
    await fetchData();
    if (selectedAsset?.id === assetId) {
      const updated = await getTrazabilidadAsset(assetId);
      if (updated) setSelectedAsset(updated);
    }
  };

  const handleRegisterAsset = async (asset: Partial<Asset>) => {
    await registerTrazabilidadAsset(asset);
    await fetchData();
  };

  const handleEditAsset = async (id: string, asset: Partial<Asset>) => {
    await editTrazabilidadAsset(id, asset);
    await fetchData();
    if (selectedAsset?.id === id) {
      const updated = await getTrazabilidadAsset(id);
      if (updated) setSelectedAsset(updated);
    }
  };

  const handleDisableAsset = async (id: string) => {
    await disableTrazabilidadAsset(id);
    await fetchData(); // Refresh data
    if (selectedAsset?.id === id) {
      const updated = await getTrazabilidadAsset(id);
      if (updated) setSelectedAsset(updated);
    }
  };

  const navigateToDetail = async (asset: Asset) => {
    setView("detail");
    setLoadingView(true);
    setError(null);
    try { setSelectedAsset(await getTrazabilidadAsset(asset.id) || null); }
    catch (error) { setError(error instanceof Error ? error.message : "No se pudo cargar el activo"); }
    finally { setLoadingView(false); }
  };

  const navigateToMovementDetail = async (movement: Movement) => {
    setView("movement_detail");
    setLoadingView(true);
    setError(null);
    try { setSelectedMovement(await getTrazabilidadMovement(movement.id) || null); }
    catch (error) { setError(error instanceof Error ? error.message : "No se pudo cargar el movimiento"); }
    finally { setLoadingView(false); }
  };

  return {
    view,
    setView,
    assetList,
    filteredAssets,
    selectedAsset,
    setSelectedAsset,
    movementList,
    selectedMovement,
    setSelectedMovement,
    search,
    setSearch,
    filterLocation,
    setFilterLocation,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    filterUbication,
    setFilterUbication,
    filterDisabled,
    setFilterDisabled,
    stats,
    loading: loadingView,
    error,
    handleRegisterMovement,
    handleRegisterBulkMovement,
    handleRegisterReplacementMovement,
    handleAddCertificate,
    handleRegisterAsset,
    handleEditAsset,
    handleDisableAsset,
    navigateToDetail,
    navigateToMovementDetail,
    refresh: fetchData,
  };
}
