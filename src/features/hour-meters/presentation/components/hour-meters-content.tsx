"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useHourMeters } from "../hooks/use-hour-meters";
import { HourMeterCard, EnhancedHourMeterRecord } from "./hour-meter-card";
import { MaintenancePanel } from "./maintenance-panel/maintenance-panel";
import { useMaintenancePanel } from "../hooks/use-maintenance-panel";

/**
 * Componente principal de presentación (Page/Organism) que representa la vista
 * del Dashboard de Horómetros con telemetría en tiempo real y panel de mantenimiento.
 */
export function HourMeterContent() {
  const { records, loading } = useHourMeters() as { records: any[]; loading: boolean };
  const [lastSync, setLastSync] = useState("hace 1 min");
  
  // Hook de estado para el panel lateral de mantenimiento
  const { selectedEquipmentId, resolvedPlan, isLoading, selectEquipment, closePanel } = useMaintenancePanel();

  // Subtle live update simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync("hace unos segundos");
      setTimeout(() => setLastSync("hace 1 min"), 20000);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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

  // Mapear los registros a registros enriquecidos para las tarjetas
  const enhancedRecords: EnhancedHourMeterRecord[] = records.map((record) => {
    const remainingHours = record.maxThreshold - record.currentReading;
    const isCritical = remainingHours <= 250;
    const isWarning = remainingHours > 250 && remainingHours <= 500;
    const isNormal = remainingHours > 500;
    const progressValue = Math.min(100, Math.max(0, (record.currentReading / record.maxThreshold) * 100));

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

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="relative flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-3 rounded-full bg-emerald-500"></span>
              </span>
              <span className="font-mono text-xs tracking-wider text-emerald-500 uppercase font-semibold">
                Conectado
              </span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground mt-1">
              Actualizado {lastSync}
            </span>
          </div>
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
        {/* Grid original — se contrae cuando el panel está abierto */}
        <div className={`min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 overflow-y-auto transition-all duration-300 ${selectedEquipmentId ? 'flex-1' : 'w-full'}`}>
          {enhancedRecords.map((record) => (
            <HourMeterCard
              key={record.id}
              record={record}
              isSelected={selectedEquipmentId === record.id}
              onClick={() => selectEquipment(record)}
            />
          ))}
        </div>

        {/* Panel lateral - visible en pantallas grandes (desktop) */}
        {selectedEquipmentId && (
          <div className="hidden lg:block h-full animate-in slide-in-from-right duration-300">
            <MaintenancePanel
              resolvedPlan={resolvedPlan}
              isLoading={isLoading}
              onClose={closePanel}
            />
          </div>
        )}
      </div>

      {/* Panel responsivo en móvil/tablet - Drawer/Overlay superpuesto (pantallas < lg) */}
      {selectedEquipmentId && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="w-full max-h-[85vh] bg-card border border-border rounded-t-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in slide-in-from-bottom duration-300">
            <div className="flex-1 overflow-y-auto min-h-0">
              <MaintenancePanel
                resolvedPlan={resolvedPlan}
                isLoading={isLoading}
                onClose={closePanel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
