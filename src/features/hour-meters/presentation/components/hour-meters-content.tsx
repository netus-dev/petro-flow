"use client";

import { useState, useEffect } from "react";
import { Activity, Clock } from "lucide-react";
import { Card, CardContent } from "@/src/core/presentation/components/ui/card";
import { Badge } from "@/src/core/presentation/components/ui/badge";
import { useHourMeters } from "../hooks/use-hour-meters";

// Type definition from entities but not exported, so inferring or redeclaring is fine, but we have records array
type HourMeterRecord = {
  id: string;
  platform: string;
  equipment: string;
  currentReading: number;
  previousReading: number;
  unit: string;
  lastUpdated: string;
  maxThreshold: number;
  status: "normal" | "warning" | "critical";
};

export function HourMeterContent() {
  const { records, loading } = useHourMeters() as { records: HourMeterRecord[]; loading: boolean };
  const [lastSync, setLastSync] = useState("hace 1 min");

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
          <Activity className="size-8 animate-pulse text-primary" />
          <p className="font-mono text-sm tracking-widest text-muted-foreground uppercase">
            CARGANDO TELEMETRÍA...
          </p>
        </div>
      </div>
    );
  }

  // Calculate specific thresholds required by the new logic
  const enhancedRecords = records.map((record) => {
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
    <div className="flex flex-col h-screen max-h-screen w-full bg-background overflow-hidden p-4 md:p-6 lg:p-8">
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

      {/* Main Grid - Fills remaining space dynamically */}
      <div className="flex-1 min-h-0 min-w-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-4 overflow-hidden">
        {enhancedRecords.map((record) => {
          let cardBg = "bg-card border-border/50 hover:border-border";
          let textColor = "text-foreground";
          let badgeText = "Normal";
          let progressIndicatorColor = "bg-primary";

          if (record.isCritical) {
            cardBg = "bg-orange-950/20 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.05)]";
            textColor = "text-orange-500";
            badgeText = "Mantenimiento Crítico";
            progressIndicatorColor = "bg-orange-500";
          } else if (record.isWarning) {
            cardBg = "bg-amber-950/20 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]";
            textColor = "text-amber-500";
            badgeText = "Próximo a Mantenimiento";
            progressIndicatorColor = "bg-amber-500";
          }

          return (
            <Card
              key={record.id}
              className={`transition-colors duration-500 ${cardBg} h-full overflow-hidden flex flex-col`}
            >
              <CardContent className="p-4 md:p-5 flex flex-col h-full grow">
                {/* Upper Section */}
                <div className="flex flex-col items-start gap-1 pb-2 border-b border-border/40">
                  <h3 className="text-base md:text-lg font-bold tracking-tight text-foreground line-clamp-1">
                    {record.equipment}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-mono opacity-70 tracking-widest uppercase">
                      {record.id}
                    </p>
                    {record.isWarning ? (
                      <span className="text-amber-500 text-[9px] font-medium tracking-wider uppercase bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {badgeText}
                      </span>
                    ) : record.isCritical ? (
                      <span className="text-orange-500 text-[9px] font-medium tracking-wider uppercase bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 animate-pulse">
                        {badgeText}
                      </span>
                    ) : (
                      <span className="text-emerald-500 text-[9px] font-medium tracking-wider uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {badgeText}
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Focus */}
                <div className="flex-1 flex flex-col justify-center min-h-0">
                  <div className="flex items-baseline gap-1.5 justify-center py-2">
                    <span className="text-4xl md:text-5xl lg:text-6xl font-black font-mono tabular-nums tracking-tighter text-foreground drop-shadow-sm leading-none">
                      {record.currentReading.toLocaleString()}
                    </span>
                    <span className="text-lg md:text-xl font-mono text-muted-foreground font-bold">
                      h
                    </span>
                  </div>
                </div>

                {/* Lower Section */}
                <div className="mt-auto shrink-0 pt-3 border-t border-border/40">
                  <p className={`text-xs md:text-sm font-medium mb-3 ${textColor}`}>
                    Faltan <span className="font-bold font-mono text-base">{record.remainingHours.toLocaleString()}</span> hrs para límite de {record.maxThreshold.toLocaleString()}h
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-mono font-medium tracking-widest text-muted-foreground uppercase">
                      <span>{record.currentReading.toLocaleString()}h</span>
                      <span>{record.maxThreshold.toLocaleString()}h</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary/60 overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${progressIndicatorColor}`}
                        style={{ width: `${record.progressValue}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
