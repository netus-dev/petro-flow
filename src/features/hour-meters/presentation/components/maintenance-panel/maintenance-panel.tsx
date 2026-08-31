"use client";

import { X, Clock, AlertTriangle, Settings, Package } from "lucide-react";
import { getInventoryAvailability, ResolvedMaintenancePlan } from "../../../domain/entities";
import { ActivityList } from "./activity-list";
import { useEquipmentKpi } from "../../hooks/use-equipment-kpi";
import { KpiMetricGrid } from "./kpi-metric-grid";
import { useHourMeters } from "../../hooks/use-hour-meters";
import { useAssetInventory } from "../../hooks/use-asset-inventory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/core/presentation/components/ui/tabs";


/**
 * Props para el componente MaintenancePanel.
 */
export interface MaintenancePanelProps {
  /** Plan resuelto con el próximo umbral calculado y actividades fusionadas. */
  resolvedPlan: ResolvedMaintenancePlan | null;
  /** Indica si la consulta de planes de mantenimiento está en curso. */
  isLoading?: boolean;
  /** Callback para cerrar el panel lateral (botón X). */
  onClose: () => void;
}

/**
 * Componente de presentación (Organism) que muestra el plan de mantenimiento actual
 * y próximo de un activo. Maneja estados de carga (Skeleton) y estados vacíos.
 */
export function MaintenancePanel({ resolvedPlan, isLoading, onClose }: MaintenancePanelProps) {
  const { kpi, isLoading: isKpiLoading, reliabilityPeriod, setReliabilityPeriod } = useEquipmentKpi(
    resolvedPlan?.equipmentId ?? null
  );
  const { dailyKpi } = useHourMeters();
  const { items: inventory, isLoading: isInventoryLoading, error: inventoryError } = useAssetInventory(resolvedPlan?.equipmentId ?? null);

  // 1. Estado de carga (Skeleton Screen)
  if (isLoading) {
    return (
      <aside className="w-full lg:w-[440px] shrink-0 border border-border bg-card/40 backdrop-blur-md rounded-xl p-4 flex flex-col h-full min-h-0 overflow-hidden animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-5">
          <div className="space-y-2 w-2/3">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          <div className="size-8 bg-muted rounded-full"></div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
        {/* KPI Skeleton Grid */}
        <div className="mb-5">
          <KpiMetricGrid
            kpi={null}
            isLoading={true}
            reliabilityPeriod="1m"
            onReliabilityPeriodChange={() => {}}
          />
        </div>

        {/* Focus Stats Skeleton */}
        <div className="bg-muted/30 border border-border/30 rounded-lg p-4 mb-5 space-y-3">
          <div className="h-3 bg-muted rounded w-1/3"></div>
          <div className="h-10 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>

        {/* Activities List Title Skeleton */}
        <div className="h-5 bg-muted rounded w-1/2 mb-4"></div>

        {/* Activity Items Skeleton */}
        <div className="space-y-3 pr-1">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border border-border/30 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
        </div>
      </aside>
    );
  }

  // 2. Estado vacío (Sin activo seleccionado o sin datos)
  if (!resolvedPlan) {
    return (
      <aside className="w-full lg:w-[440px] shrink-0 border border-border/50 bg-card/25 backdrop-blur-md rounded-xl p-6 flex flex-col items-center justify-center text-center h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted/80 text-muted-foreground transition-colors"
          aria-label="Cerrar panel"
        >
          <X className="size-5" />
        </button>
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/30 border border-border/50 text-muted-foreground/60 mb-4">
          <Clock className="size-7" />
        </div>
        <h3 className="font-mono text-sm tracking-widest text-muted-foreground uppercase font-bold">
          Sin Selección
        </h3>
        <p className="text-xs text-muted-foreground max-w-[240px] mt-2">
          Seleccione un activo del panel izquierdo para visualizar su plan de mantenimiento estimado.
        </p>
      </aside>
    );
  }

  // 3. Estado con plan resuelto (MVP - El detalle de lista se completará en US3)
  const remainingHours = resolvedPlan.nextThresholdHours - resolvedPlan.currentReading;
  const isThresholdClose = remainingHours <= 100;

  // Selección de badge
  let badgeColor = "bg-primary/10 text-primary border-primary/20";
  let badgeText = "Cíclico";

  if (resolvedPlan.planType === "fixed") {
    badgeColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
    badgeText = "Umbral Fijo";
  } else if (resolvedPlan.planType === "merged") {
    badgeColor = "bg-purple-500/10 text-purple-500 border-purple-500/20";
    badgeText = "Fusión";
  }

  return (
    <aside className="w-full lg:w-[440px] shrink-0 border border-border bg-card/60 backdrop-blur-md rounded-xl p-4 flex flex-col h-full shadow-lg relative min-h-0 overflow-hidden">
      {/* Panel Header */}
      <header className="shrink-0 flex items-start justify-between border-b border-border/40 bg-card/95 pt-1 pb-3 mb-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground font-mono uppercase truncate max-w-[280px]">
            {resolvedPlan.equipmentName}
          </h2>
          <p className="text-[10px] font-mono text-muted-foreground tracking-wider mt-0.5">
            ACTIVO: {resolvedPlan.equipmentId}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-muted/80 text-muted-foreground transition-colors"
          aria-label="Cerrar panel"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
      {/* KPI Metric Grid */}
      <div className="mb-3">
        <KpiMetricGrid
          kpi={kpi}
          isLoading={isKpiLoading}
          reliabilityPeriod={reliabilityPeriod}
          onReliabilityPeriodChange={setReliabilityPeriod}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        <div className="bg-muted/30 border border-border/50 rounded-lg p-2.5">
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Consumo de Diésel (Últimas 24 hrs)</p>
          <p className="text-2xl font-black font-mono text-foreground">{dailyKpi?.dieselGallons.toLocaleString("es-ES") ?? "—"} <span className="text-xs text-muted-foreground">gal</span></p>
          <p className="text-[10px] text-muted-foreground">Última actualización: {dailyKpi ? new Date(dailyKpi.lastUpdated).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "Cargando..."}</p>
        </div>
        <div className="bg-muted/30 border border-border/50 rounded-lg p-2.5">
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Megavatios (MW) Generados (Últimas 24 hrs)</p>
          <p className="text-2xl font-black font-mono text-foreground">{dailyKpi?.generatedMw.toLocaleString("es-ES") ?? "—"} <span className="text-xs text-muted-foreground">MW</span></p>
          <p className="text-[10px] text-muted-foreground">Última actualización: {dailyKpi ? new Date(dailyKpi.lastUpdated).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "Cargando..."}</p>
        </div>
      </div>

      {/* Target Info Summary Block */}
      <div className="bg-muted/40 border border-border/60 rounded-lg p-3 mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Próximo Límite
          </span>
          <span className={`text-[9px] font-medium tracking-wider uppercase px-2 py-0.5 rounded border ${badgeColor}`}>
            {badgeText}
          </span>
        </div>
        <div className="flex items-baseline gap-1 py-1">
          <span className="text-2xl font-black font-mono tracking-tight text-foreground">
            {resolvedPlan.nextThresholdHours.toLocaleString()}
          </span>
          <span className="text-sm font-mono text-muted-foreground font-bold">h</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          {isThresholdClose ? (
            <AlertTriangle className="size-3.5 text-orange-500 shrink-0" />
          ) : (
            <Clock className="size-3.5 text-muted-foreground shrink-0" />
          )}
          <p className={`text-xs font-medium ${isThresholdClose ? "text-orange-500 font-bold" : "text-muted-foreground"}`}>
            Faltan <span className="font-mono">{remainingHours.toLocaleString()}h</span> (Lectura actual: {resolvedPlan.currentReading.toLocaleString()}h)
          </p>
        </div>
      </div>

      <Tabs defaultValue="maintenance" className="flex flex-col">
        <TabsList className="sticky top-0 z-10 w-full justify-start bg-card/95 border-b border-border/50 rounded-none p-0">
          <TabsTrigger value="maintenance" className="text-xs">Tareas</TabsTrigger>
          <TabsTrigger value="inventory" className="text-xs">Inventario</TabsTrigger>
        </TabsList>
        <TabsContent value="maintenance" className="mt-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase font-mono flex items-center gap-1.5"><Settings className="size-3.5" />Actividades planificadas</h3>
            <span className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{resolvedPlan.activities.length} tareas</span>
          </div>
          <ActivityList activities={resolvedPlan.activities} />
        </TabsContent>
          <TabsContent value="inventory" className="mt-3">
            {inventory[0]?.scope === "shared_equipment_type" && <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-2 text-[11px] text-muted-foreground">Inventario compartido para <strong className="text-foreground">{inventory[0].equipmentType}</strong>. Las cantidades corresponden al stock común de este tipo de equipo.</div>}
          {isInventoryLoading ? <div className="space-y-3 animate-pulse"><div className="h-12 rounded-lg bg-muted" /><div className="h-12 rounded-lg bg-muted" /></div> : inventoryError ? <p className="text-xs text-red-500">{inventoryError}</p> : inventory.length === 0 ? <p className="text-xs text-muted-foreground text-center py-8">No hay inventario asignado a este activo.</p> : <div className="space-y-2">
            {inventory.map((item) => {
              const availability = getInventoryAvailability(item);
              const status = availability === "sufficient" ? ["Stock Suficiente", "text-emerald-500 bg-emerald-500/10"] : availability === "critical" ? ["Stock Crítico", "text-yellow-600 bg-yellow-500/10"] : ["Sin Stock", "text-red-500 bg-red-500/10"];
              return <div key={item.id} className="rounded-lg border border-border/50 p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-xs font-semibold flex items-center gap-1.5"><Package className="size-3.5 text-muted-foreground" />{item.material}</p><p className="text-[10px] text-muted-foreground mt-1">{item.specification}</p></div><span className={`shrink-0 rounded px-2 py-1 text-[9px] font-semibold ${status[1]}`}>{status[0]}</span></div><div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>Cantidad en Stock</span><strong className="text-foreground">{item.quantityInStock}</strong></div></div>;
            })}
          </div>}
        </TabsContent>
      </Tabs>
      </div>
    </aside>
  );
}
