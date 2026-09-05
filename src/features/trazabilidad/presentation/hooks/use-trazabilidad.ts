import { useState, useEffect, useMemo, useCallback } from "react";
import { AssetMovementPayload, Asset, TrazabilidadStats, Movement } from "../../domain/entities";
import {
  addTrazabilidadCertificates, disableTrazabilidadAsset, editTrazabilidadAsset,
  getTrazabilidadAsset, readTrazabilidadData, registerTrazabilidadAsset,
  registerTrazabilidadBulkMovement, registerTrazabilidadMovement,
  registerTrazabilidadReplacement,
} from "../../infrastructure/server/trazabilidad-actions";

export type TrazabilidadView = "dashboard" | "list" | "detail" | "movement_list" | "movement_detail";

export function useTrazabilidad() {
  const [view, setView] = useState<TrazabilidadView>("dashboard");
  const [assetList, setAssetList] = useState<Asset[]>([]);
  const [stats, setStats] = useState<TrazabilidadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [movementList, setMovementList] = useState<Movement[]>([]);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterUbication, setFilterUbication] = useState<string>("all");
  const [filterDisabled, setFilterDisabled] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assets, dashboardStats, movements] = await readTrazabilidadData();
      setAssetList(assets);
      setStats(dashboardStats);
      setMovementList(movements);
    } catch (error) {
      console.error("Error fetching trazabilidad data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    await fetchData(); // Refresh data
    if (selectedAsset?.id === assetId) {
      const updated = await getTrazabilidadAsset(assetId);
      if (updated) setSelectedAsset(updated);
    }
  };

  const handleRegisterBulkMovement = async (payload: AssetMovementPayload) => {
    await registerTrazabilidadBulkMovement(payload);
    await fetchData(); // Refresh data
  };

  const handleRegisterReplacementMovement = async (payload: any) => {
    await registerTrazabilidadReplacement(payload);
    await fetchData(); // Refresh data
  };

  const handleAddCertificate = async (assetId: string, certificates: { file: File; name: string }[]) => {
    await addTrazabilidadCertificates(assetId, certificates);
    await fetchData(); // Refresh data
    if (selectedAsset?.id === assetId) {
      const updated = await getTrazabilidadAsset(assetId);
      if (updated) setSelectedAsset(updated);
    }
  };

  const handleRegisterAsset = async (asset: Partial<Asset>) => {
    await registerTrazabilidadAsset(asset);
    await fetchData(); // Refresh data
  };

  const handleEditAsset = async (id: string, asset: Partial<Asset>) => {
    await editTrazabilidadAsset(id, asset);
    await fetchData(); // Refresh data
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

  const navigateToDetail = (asset: Asset) => {
    setSelectedAsset(asset);
    setView("detail");
  };

  const navigateToMovementDetail = (movement: Movement) => {
    setSelectedMovement(movement);
    setView("movement_detail");
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
    loading,
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
