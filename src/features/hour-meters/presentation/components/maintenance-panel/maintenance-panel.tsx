"use client";

import { X, Clock, AlertTriangle, Settings } from "lucide-react";
import { ResolvedMaintenancePlan } from "../../../domain/entities";
import { ActivityList } from "./activity-list";

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
  // 1. Estado de carga (Skeleton Screen)
  if (isLoading) {
    return (
      <aside className="w-full lg:w-[400px] shrink-0 border border-border bg-card/40 backdrop-blur-md rounded-xl p-5 flex flex-col h-full animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-5">
          <div className="space-y-2 w-2/3">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          <div className="size-8 bg-muted rounded-full"></div>
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
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
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
      </aside>
    );
  }

  // 2. Estado vacío (Sin activo seleccionado o sin datos)
  if (!resolvedPlan) {
    return (
      <aside className="w-full lg:w-[400px] shrink-0 border border-border/50 bg-card/25 backdrop-blur-md rounded-xl p-6 flex flex-col items-center justify-center text-center h-full">
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
    <aside className="w-full lg:w-[400px] shrink-0 border border-border bg-card/60 backdrop-blur-md rounded-xl p-5 flex flex-col h-full shadow-lg relative min-h-0 overflow-hidden">
      {/* Panel Header */}
      <header className="shrink-0 flex items-start justify-between border-b border-border/40 pb-4 mb-4">
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

      {/* Target Info Summary Block */}
      <div className="shrink-0 bg-muted/40 border border-border/60 rounded-lg p-4 mb-4">
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

      <div className="shrink-0 flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase font-mono flex items-center gap-1.5">
          <Settings className="size-3.5 text-muted-foreground" />
          Actividades Planificadas
        </h3>
        <span className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
          {resolvedPlan.activities.length} tareas
        </span>
      </div>

      {/* Activities List Area - Placed inside a container to scroll internally if needed */}
      <div className="flex-1 min-h-0">
        <ActivityList activities={resolvedPlan.activities} />
      </div>
    </aside>
  );
}
