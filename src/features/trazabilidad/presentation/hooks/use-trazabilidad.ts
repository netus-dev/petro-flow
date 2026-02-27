import { useState, useEffect, useMemo, useCallback } from "react";
import { Asset, TrazabilidadStats } from "../../domain/entities";
import { MockTrazabilidadRepository } from "../../infrastructure/repository";
import {
  AddCertificateUseCase,
  GetAssetListUseCase,
  GetDashboardStatsUseCase,
  RegisterMovementUseCase,
  RegisterAssetUseCase,
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

  const repository = useMemo(() => new MockTrazabilidadRepository(), []);

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

  const addCertificateUseCase = useMemo(
    () => new AddCertificateUseCase(repository),
    [repository],
  );

  const registerAssetUseCase = useMemo(
    () => new RegisterAssetUseCase(repository),
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
      const matchesSearch =
        asset.code.toLowerCase().includes(search.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
        asset.name.toLowerCase().includes(search.toLowerCase());

      const matchesLocation =
        filterLocation === "all" || asset.currentLocation === filterLocation;
      const matchesStatus =
        filterStatus === "all" || asset.status === filterStatus;
      const matchesType =
        filterType === "all" || asset.functionalPrinciple === filterType;

      return matchesSearch && matchesLocation && matchesStatus && matchesType;
    });
  }, [assetList, search, filterLocation, filterStatus, filterType]);

  const handleRegisterMovement = async (assetId: string, movement: any) => {
    await registerMovementUseCase.execute(assetId, movement);
    await fetchData(); // Refresh data
    if (selectedAsset?.id === assetId) {
      const updated = await repository.getAssetById(assetId);
      if (updated) setSelectedAsset(updated);
    }
  };

  const handleAddCertificate = async (assetId: string, certificate: any) => {
    await addCertificateUseCase.execute(assetId, certificate);
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
    stats,
    loading,
    handleRegisterMovement,
    handleAddCertificate,
    handleRegisterAsset,
    navigateToDetail,
    refresh: fetchData,
  };
}
