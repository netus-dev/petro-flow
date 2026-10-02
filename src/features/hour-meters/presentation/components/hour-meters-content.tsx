"use client";

import { Clock, Gauge, Package, Settings2 } from "lucide-react";
import { useHourMeters } from "../hooks/use-hour-meters";
import { HourMeterCard, EnhancedHourMeterRecord } from "./hour-meter-card";
import { MaintenancePanel } from "./maintenance-panel/maintenance-panel";
import { useMaintenancePanel } from "../hooks/use-maintenance-panel";
import { Button } from "@/src/core/presentation/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/core/presentation/components/ui/dialog";
import { RegisterHourMeterForm } from "./register-hour-meter-form";
import { InventoryManagementModal } from "./inventory-management-modal";
import { canUseHourMeterCapability, HOUR_METER_CAPABILITIES, HourMeterAuthorization } from "../../domain/permissions";
import { calculateRemainingMaintenanceHours, HourMeterRecord } from "../../domain/entities";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MaintenanceThresholdModal } from "./maintenance-threshold-modal";
import { readMaintenanceThresholds } from "../../infrastructure/server/hour-meter-actions";
import { deriveVisibleInventoryPrinciples } from "./inventory-principles";
import { ModuleHeader } from "@/src/core/presentation/components/layout/module-header";
import { ModuleShell } from "@/src/core/presentation/components/layout/module-shell";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/core/presentation/components/ui/tooltip";

/**
 * Componente principal de presentación (Page/Organism) que representa la vista
 * del Dashboard de Horómetros con telemetría en tiempo real y panel de mantenimiento.
 */
export function HourMeterContent({ initialRecords = [], authorization = { capabilities: [], enabledModules: [] }, principles = [], rigs = [], initialRigId }: { initialRecords?: HourMeterRecord[]; authorization?: HourMeterAuthorization; principles?: Array<{ id: string; name: string }>; rigs?: Array<{ id: string; name: string }>; initialRigId?: string }) {
  const [rigId, setRigId] = useState(initialRigId ?? rigs[0]?.id);
  const router = useRouter();
  const { records, loading, refresh, error } = useHourMeters(initialRecords, rigId);
  const canRegister = canUseHourMeterCapability(authorization, HOUR_METER_CAPABILITIES.register);
  const canManageInventory = canUseHourMeterCapability(authorization, HOUR_METER_CAPABILITIES.manage);
  const canManageMaintenance = canUseHourMeterCapability(authorization, HOUR_METER_CAPABILITIES.manage);
  // Hook de estado para el panel lateral de mantenimiento
  const { selectedEquipmentId, resolvedPlan, isLoading, selectEquipment, closePanel } = useMaintenancePanel();
  const [thresholdsByPrinciple, setThresholdsByPrinciple] = useState<Record<string, number[]>>({});
  const inventoryPrinciples = deriveVisibleInventoryPrinciples(records, principles);

  useEffect(() => {
    const principleIds = [...new Set(records.map((record) => record.functionalPrincipleId).filter((id): id is string => Boolean(id)))];
    if (!principleIds.length) return;
    void Promise.all(principleIds.map(async (principleId) => {
      const result = await readMaintenanceThresholds(principleId);
      return [principleId, result.ok ? result.data.map((item) => item.thresholdHours) : []] as const;
    })).then((entries) => setThresholdsByPrinciple(Object.fromEntries(entries)));
  }, [records]);

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
    const functionalPrincipleName = principles.find((principle) => principle.id === record.functionalPrincipleId)?.name ?? "Sin principio funcional";
    const remainingHours = calculateRemainingMaintenanceHours(thresholdsByPrinciple[record.functionalPrincipleId ?? ""] ?? [], record.currentReading);
    const isCritical = remainingHours !== null && remainingHours <= 168;
    const isWarning = remainingHours !== null && remainingHours > 168 && remainingHours <= 336;
    const isNormal = remainingHours !== null && remainingHours > 336;
    const progressValue = record.currentReading === null ? 0 : Math.min(100, Math.max(0, (record.currentReading / record.maxThreshold) * 100));

    return {
      ...record,
      functionalPrincipleName,
      remainingHours,
      isCritical,
      isWarning,
      isNormal,
      progressValue,
    };
  });

  return (
    <ModuleShell
      className="bg-background"
      header={
        <ModuleHeader title="Dashboard de Horómetros" icon={Clock} actions={<>
          {rigs.length > 1 ? <select aria-label="Rig" className="h-8 rounded border bg-background px-2 text-xs" value={rigId ?? ""} onChange={(event) => setRigId(event.target.value)}>{rigs.map((rig) => <option key={rig.id} value={rig.id}>{rig.name}</option>)}</select> : <span className="hidden text-xs font-medium tracking-widest text-muted-foreground uppercase md:inline">{rigs[0]?.name ?? "SIN RIG AUTORIZADO"}</span>}
          {canManageInventory && <Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild><Button size="icon" variant="outline" aria-label="Gestionar inventario"><Package className="size-4" aria-hidden="true" /></Button></DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Gestionar inventario</TooltipContent>
            </Tooltip>
            <DialogContent className="w-[min(96vw,1400px)] max-w-none sm:max-w-[min(96vw,1400px)] max-h-[90vh] overflow-hidden p-6" aria-describedby="inventory-management-description">
              <DialogHeader><DialogTitle>Gestionar inventario</DialogTitle><p id="inventory-management-description" className="text-sm text-muted-foreground">Registra y actualiza materiales compartidos por principio funcional.</p></DialogHeader>
              <InventoryManagementModal key={inventoryPrinciples.map((principle) => principle.id).join(":")} principles={inventoryPrinciples} />
            </DialogContent>
          </Dialog>}
          {principles.length > 0 && <Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild><Button size="icon" variant="outline" aria-label="Configurar mantenimientos"><Settings2 className="size-4" aria-hidden="true" /></Button></DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Configurar mantenimientos</TooltipContent>
            </Tooltip>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar mantenimientos</DialogTitle>
              </DialogHeader>
              <MaintenanceThresholdModal
                principles={principles}
                canEdit={canManageMaintenance}
                onSaved={() => router.refresh()}
              />
            </DialogContent>
          </Dialog>}
          {canRegister && <Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild><Button size="icon" aria-label="Registrar lectura"><Gauge className="size-4" aria-hidden="true" /></Button></DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Registrar lectura</TooltipContent>
            </Tooltip>
            <DialogContent>
              <DialogHeader><DialogTitle>Registrar lectura de horómetro</DialogTitle></DialogHeader>
              <RegisterHourMeterForm onRegistered={() => void refresh()} />
            </DialogContent>
          </Dialog>}
        </>} />
      }
    >
      <div className="flex min-h-full p-4 md:p-6 lg:p-8">
        {/* Main Container - Fills remaining space dynamically */}
        <div className="relative flex min-h-0 flex-1 flex-row gap-4 overflow-hidden">
          {/* Grid de tarjetas — se ajusta automáticamente al espacio disponible */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-visible p-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
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
            className={`hidden h-full shrink-0 overflow-hidden transition-all duration-300 ease-in-out lg:block ${selectedEquipmentId
              ? "w-[440px] opacity-100"
              : "pointer-events-none w-0 opacity-0"
              }`}
          >
            <div className="h-full w-[440px]">
              <MaintenancePanel
                resolvedPlan={resolvedPlan}
                isLoading={isLoading}
                onClose={closePanel}
              />
            </div>
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
    </ModuleShell>
  );
}
