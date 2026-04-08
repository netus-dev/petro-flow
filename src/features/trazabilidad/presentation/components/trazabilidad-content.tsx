"use client";

import {
  Route,
  Loader2,
  ChevronRight,
  Database,
  LayoutDashboard,
  Plus,
} from "lucide-react";
import { Button } from "@/src/core/presentation/components/ui/button";
import { useTrazabilidad } from "../hooks/use-trazabilidad";
import { TrazabilidadDashboard } from "./trazabilidad-dashboard";
import { AssetTable } from "./asset-table";
import { AssetDetail } from "./asset-detail";
import { RegisterAssetModal } from "./register-asset-modal";
import { RegisterBatchMovementModal } from "./register-batch-movement-modal";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/core/presentation/components/ui/breadcrumb";

export function TrazabilidadContent() {
  const {
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
    handleRegisterAsset,
    handleEditAsset,
    handleDisableAsset,
    handleRegisterMovement,
    handleRegisterBulkMovement,
    handleAddCertificate,
    navigateToDetail,
  } = useTrazabilidad();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 border border-primary/20">
              <Route className="size-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight">
              Trazabilidad de Activos
            </h1>
          </div>
          <Breadcrumb>
            <BreadcrumbList className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dashboard"
                  className="hover:text-primary transition-colors"
                >
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground">
                  Trazabilidad
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-3">
          <RegisterBatchMovementModal assets={filteredAssets} onRegister={handleRegisterBulkMovement} />
          <RegisterAssetModal onRegister={handleRegisterAsset} />
        </div>
      </div>

      {/* Navigation Tabs (View Switcher) */}
      {view !== "detail" && (
        <div className="flex items-center gap-2 bg-secondary/20 p-1 rounded-lg border border-border w-fit">
          <Button
            variant={view === "dashboard" ? "default" : "ghost"}
            size="sm"
            className="h-8 gap-2 text-xs px-4"
            onClick={() => setView("dashboard")}
          >
            <LayoutDashboard className="size-3.5" />
            Dashboard
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            className="h-8 gap-2 text-xs px-4"
            onClick={() => setView("list")}
          >
            <Database className="size-3.5" />
            Listado de Activos
          </Button>
        </div>
      )}

      {/* View Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {view === "dashboard" && <TrazabilidadDashboard stats={stats} />}

        {view === "list" && (
          <AssetTable
            assets={filteredAssets}
            allAssets={assetList}
            onViewDetail={navigateToDetail}
            search={search}
            setSearch={setSearch}
            locationFilter={filterLocation}
            setLocationFilter={setFilterLocation}
            statusFilter={filterStatus}
            setStatusFilter={setFilterStatus}
            typeFilter={filterType}
            setTypeFilter={setFilterType}
            ubicationFilter={filterUbication}
            setUbicationFilter={setFilterUbication}
            disabledFilter={filterDisabled}
            setDisabledFilter={setFilterDisabled}
            onEditAsset={handleEditAsset}
          />
        )}

        {view === "detail" && selectedAsset && (
          <AssetDetail
            asset={selectedAsset}
            onBack={() => setView("list")}
            onAddCertificate={handleAddCertificate}
            onEditAsset={handleEditAsset}
            onDisableAsset={handleDisableAsset}
          />
        )}
      </div>
    </div>
  );
}
