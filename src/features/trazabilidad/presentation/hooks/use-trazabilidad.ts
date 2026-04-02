import { useState, useEffect, useMemo, useCallback } from "react";
import { AssetMovementPayload, Asset, TrazabilidadStats } from "../../domain/entities";
import { trazabilidadRepository } from "../../infrastructure/repository";
import {
  AddCertificateUseCase,
  GetAssetListUseCase,
  GetDashboardStatsUseCase,
  RegisterMovementUseCase,
  RegisterBulkMovementUseCase,
  RegisterAssetUseCase,
  EditAssetUseCase,
  DisableAssetUseCase,
} from "../../application/use-cases";

export type TrazabilidadView = "dashboard" | "list" | "detail";

export function useTrazabilidad() {
  const [view, setView] = useState<TrazabilidadView>("dashboard");
  const [assetList, setAssetList] = useState<Asset[]>([]);
  const [stats, setStats] = useState<TrazabilidadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterUbication, setFilterUbication] = useState<string>("all");
  const [filterDisabled, setFilterDisabled] = useState<boolean>(false);

  const repository = trazabilidadRepository;

  const getAssetListUseCase = useMemo(
    () => new GetAssetListUseCase(repository),
    [repository],
  );

  const getDashboardStatsUseCase = useMemo(
    () => new GetDashboardStatsUseCase(repository),
    [repository],
  );

  const registerMovementUseCase = useMemo(
    () => new RegisterMovementUseCase(repository),
    [repository],
  );

  const registerBulkMovementUseCase = useMemo(
    () => new RegisterBulkMovementUseCase(repository),
    [repository],
  );

  const addCertificateUseCase = useMemo(
    () => new AddCertificateUseCase(repository),
    [repository],
  );

  const registerAssetUseCase = useMemo(
    () => new RegisterAssetUseCase(repository),
    [repository],
  );

  const editAssetUseCase = useMemo(
    () => new EditAssetUseCase(repository),
    [repository],
  );

  const disableAssetUseCase = useMemo(
    () => new DisableAssetUseCase(repository),
    [repository],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assetsData, statsData] = await Promise.all([
        getAssetListUseCase.execute(),
        getDashboardStatsUseCase.execute(),
      ]);
      setAssetList(assetsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching trazabilidad data:", error);
    } finally {
      setLoading(false);
    }
  }, [getAssetListUseCase, getDashboardStatsUseCase]);

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
    await registerMovementUseCase.execute(assetId, movement);
    await fetchData(); // Refresh data
    if (selectedAsset?.id === assetId) {
      const updated = await repository.getAssetById(assetId);
      if (updated) setSelectedAsset(updated);
    }
  };

  const handleRegisterBulkMovement = async (payload: AssetMovementPayload) => {
    await registerBulkMovementUseCase.execute(payload);
    await fetchData(); // Refresh data
  };

  const handleAddCertificate = async (assetId: string, certificates: { file: File; name: string }[]) => {
    await addCertificateUseCase.execute(assetId, certificates);
    await fetchData(); // Refresh data
    if (selectedAsset?.id === assetId) {
      const updated = await repository.getAssetById(assetId);
      if (updated) setSelectedAsset(updated);
    }
  };

  const handleRegisterAsset = async (asset: Partial<Asset>) => {
    await registerAssetUseCase.execute(asset);
    await fetchData(); // Refresh data
  };

  const handleEditAsset = async (id: string, asset: Partial<Asset>) => {
    await editAssetUseCase.execute(id, asset);
    await fetchData(); // Refresh data
    if (selectedAsset?.id === id) {
      const updated = await repository.getAssetById(id);
      if (updated) setSelectedAsset(updated);
    }
  };

  const handleDisableAsset = async (id: string) => {
    await disableAssetUseCase.execute(id);
    await fetchData(); // Refresh data
    if (selectedAsset?.id === id) {
      const updated = await repository.getAssetById(id);
      if (updated) setSelectedAsset(updated);
    }
  };

  const navigateToDetail = (asset: Asset) => {
    setSelectedAsset(asset);
    setView("detail");
  };

  return {
    view,
    setView,
    assetList,
    filteredAssets,
    selectedAsset,
    setSelectedAsset,
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
    handleAddCertificate,
    handleRegisterAsset,
    handleEditAsset,
    handleDisableAsset,
    navigateToDetail,
    refresh: fetchData,
  };
}
