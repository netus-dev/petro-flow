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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/core/presentation/components/ui/select";
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
    filteredAssets,
    selectedAsset,
    setSelectedAsset,
    search,
    setSearch,
    filterLocation,
    setFilterLocation,
    filterStatus,
    setFilterStatus,
    stats,
    loading,
    handleRegisterMovement,
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
          <Select defaultValue="Todos">
            <SelectTrigger className="w-[180px] h-9 text-xs bg-secondary/30 border-border">
              <SelectValue placeholder="Seleccionar RIG" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos los RIGs</SelectItem>
              <SelectItem value="702">RIG 702</SelectItem>
              <SelectItem value="703">RIG 703</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-border border-dashed font-mono uppercase text-[10px] tracking-wider"
          >
            <Plus className="size-3.5" />
            Registrar Activo
          </Button>
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
            onViewDetail={navigateToDetail}
            search={search}
            setSearch={setSearch}
            locationFilter={filterLocation}
            setLocationFilter={setFilterLocation}
            statusFilter={filterStatus}
            setStatusFilter={setFilterStatus}
          />
        )}

        {view === "detail" && selectedAsset && (
          <AssetDetail
            asset={selectedAsset}
            onBack={() => setView("list")}
            onRegisterMovement={handleRegisterMovement}
          />
        )}
      </div>
    </div>
  );
}
