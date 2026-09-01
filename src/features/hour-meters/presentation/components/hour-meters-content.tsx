"use client";

import { Clock } from "lucide-react";
import { useHourMeters } from "../hooks/use-hour-meters";
import { HourMeterCard, EnhancedHourMeterRecord } from "./hour-meter-card";
import { MaintenancePanel } from "./maintenance-panel/maintenance-panel";
import { useMaintenancePanel } from "../hooks/use-maintenance-panel";
import { Button } from "@/src/core/presentation/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/core/presentation/components/ui/dialog";
import { RegisterHourMeterForm } from "./register-hour-meter-form";
import { InventoryManagementModal } from "./inventory-management-modal";
import { canUseHourMeterPermission, HOUR_METER_PERMISSIONS } from "../../domain/permissions";
import { HourMeterRecord } from "../../domain/entities";

/**
 * Componente principal de presentación (Page/Organism) que representa la vista
 * del Dashboard de Horómetros con telemetría en tiempo real y panel de mantenimiento.
 */
export function HourMeterContent({ initialRecords = [], permissions = [] }: { initialRecords?: HourMeterRecord[]; permissions?: string[] }) {
  const { records, loading, refresh, error } = useHourMeters(initialRecords);
  const canRegister = canUseHourMeterPermission(permissions, HOUR_METER_PERMISSIONS.access);
  const canManageInventory = canUseHourMeterPermission(permissions, HOUR_METER_PERMISSIONS.inventory);
  // Hook de estado para el panel lateral de mantenimiento
  const { selectedEquipmentId, resolvedPlan, isLoading, selectEquipment, closePanel } = useMaintenancePanel();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <span className="relative flex size-6">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex size-6 rounded-full bg-primary"></span>
          </span>
          <p className="font-mono text-sm tracking-widest text-muted-foreground uppercase">
            CARGANDO TELEMETRÍA...
          </p>
        </div>
      </div>
    );
  }

  if (error) return <div role="alert" className="p-8 text-destructive">{error}</div>;

  // Mapear los registros a registros enriquecidos para las tarjetas
  const enhancedRecords: EnhancedHourMeterRecord[] = records.map((record) => {
    const remainingHours = record.currentReading === null ? record.maxThreshold : record.maxThreshold - record.currentReading;
    const isCritical = remainingHours <= 250;
    const isWarning = remainingHours > 250 && remainingHours <= 500;
    const isNormal = remainingHours > 500;
    const progressValue = record.currentReading === null ? 0 : Math.min(100, Math.max(0, (record.currentReading / record.maxThreshold) * 100));

    return {
      ...record,
      remainingHours,
      isCritical,
      isWarning,
      isNormal,
      progressValue,
    };
  });

  const stats = {
    total: enhancedRecords.length,
    criticalCount: enhancedRecords.filter(r => r.isCritical).length,
    warningCount: enhancedRecords.filter(r => r.isWarning).length,
    avgUsage: Math.round(
      enhancedRecords.reduce((acc, r) => acc + r.progressValue, 0) / (enhancedRecords.length || 1)
    ),
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] w-full bg-background overflow-hidden p-4 md:p-6 lg:p-8">
      {/* Top Header Panel (Fixed Height) */}
      <header className="shrink-0 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-inner">
            <Clock className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-mono uppercase">
              Dashboard de Horómetros
            </h1>
            <p className="text-xs md:text-sm font-medium tracking-widest text-muted-foreground uppercase mt-1">
              RIG 702 / 703
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {canManageInventory && <Dialog>
            <DialogTrigger asChild><Button size="sm" variant="outline">Gestionar inventario</Button></DialogTrigger>
            <DialogContent className="w-[min(96vw,1400px)] max-w-none max-h-[90vh] overflow-hidden p-6" aria-describedby="inventory-management-description">
              <DialogHeader><DialogTitle>Gestionar inventario</DialogTitle><p id="inventory-management-description" className="text-sm text-muted-foreground">Registra y actualiza materiales por activo o de forma compartida por tipo de equipo.</p></DialogHeader>
              <InventoryManagementModal assets={records.map(record => ({ id: record.id, equipment: record.equipment }))} />
            </DialogContent>
          </Dialog>}
          {canRegister && <Dialog>
            <DialogTrigger asChild><Button size="sm">Registrar lectura</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registrar lectura de horómetro</DialogTitle></DialogHeader>
              <RegisterHourMeterForm onRegistered={() => void refresh()} />
            </DialogContent>
          </Dialog>}
        </div>
      </header>

      {/* Mini Stats Summary Row (Fixed Height) */}
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="flex flex-col bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
            Activos
          </span>
          <span className="text-xl font-bold font-mono text-foreground">{stats.total}</span>
        </div>
        <div className="flex flex-col bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-orange-500/80 mb-1">
            Críticos (&lt; 250h)
          </span>
          <span className="text-xl font-bold font-mono text-orange-500">{stats.criticalCount}</span>
        </div>
        <div className="flex flex-col bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500/80 mb-1">
            Próximos (&lt; 500h)
          </span>
          <span className="text-xl font-bold font-mono text-amber-500">{stats.warningCount}</span>
        </div>
        <div className="flex flex-col bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary/80 mb-1">
            Uso Promedio
          </span>
          <span className="text-xl font-bold font-mono text-primary">{stats.avgUsage}%</span>
        </div>
      </div>

      {/* Main Container - Fills remaining space dynamically */}
      <div className="flex-1 min-h-0 flex flex-row gap-4 overflow-hidden relative">
        {/* Grid de tarjetas — se ajusta automáticamente al espacio disponible */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 overflow-hidden">
          {enhancedRecords.length === 0 ? <p className="col-span-full p-8 text-center text-muted-foreground">No hay activos elegibles para horómetros.</p> : enhancedRecords.map((record) => (
            <HourMeterCard
              key={record.id}
              record={record}
              isSelected={selectedEquipmentId === record.id}
              onClick={() => selectEquipment(record)}
            />
          ))}
        </div>

        {/* Panel lateral - animación suave de derecha a izquierda desplegando ancho (desktop) */}
        <div
          className={`hidden lg:block h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            selectedEquipmentId
              ? "w-[440px] opacity-100"
              : "w-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="w-[440px] h-full">
            <MaintenancePanel
              resolvedPlan={resolvedPlan}
              isLoading={isLoading}
              onClose={closePanel}
            />
          </div>
        </div>
      </div>

      {/* Panel responsivo en móvil/tablet - Drawer/Overlay superpuesto (pantallas < lg) */}
      {selectedEquipmentId && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="w-full h-[85vh] min-h-0 relative animate-in slide-in-from-bottom duration-300">
            <MaintenancePanel
              resolvedPlan={resolvedPlan}
              isLoading={isLoading}
              onClose={closePanel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
