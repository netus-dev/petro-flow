"use client";

import { Card, CardContent } from "@/src/core/presentation/components/ui/card";
import { HourMeterRecord } from "../../domain/entities";

/**
 * Representa una versión enriquecida del registro de horómetro,
 * con campos auxiliares calculados para presentación.
 */
export interface EnhancedHourMeterRecord extends HourMeterRecord {
  remainingHours: number;
  isCritical: boolean;
  isWarning: boolean;
  isNormal: boolean;
  progressValue: number;
}

/**
 * Props para el componente HourMeterCard.
 */
export interface HourMeterCardProps {
  /** Registro del horómetro enriquecido con estados calculados. */
  record: EnhancedHourMeterRecord;
  /** Si es true, aplica estilos de tarjeta seleccionada (borde primario, sombra y resalte). */
  isSelected: boolean;
  /** Callback accionado al dar clic en la tarjeta. Recibe el identificador único del activo. */
  onClick: (equipmentId: string) => void;
}

/**
 * Tarjeta individual de activo físico que visualiza sus horas acumuladas,
 * su progreso hasta el límite y su estado actual (normal, warning, critical).
 */
export function HourMeterCard({ record, isSelected, onClick }: HourMeterCardProps) {
  let cardBg = "bg-card border-border/50 hover:border-border hover:bg-card/80";
  let textColor = "text-foreground";
  let badgeText = "Normal";
  let progressIndicatorColor = "bg-primary";

  if (record.isCritical) {
    cardBg = isSelected
      ? "bg-orange-950/40 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)]"
      : "bg-orange-950/20 border-orange-500/30 hover:border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.05)]";
    textColor = "text-orange-500";
    badgeText = "Mantenimiento Crítico";
    progressIndicatorColor = "bg-orange-500";
  } else if (record.isWarning) {
    cardBg = isSelected
      ? "bg-amber-950/40 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
      : "bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.05)]";
    textColor = "text-amber-500";
    badgeText = "Próximo a Mantenimiento";
    progressIndicatorColor = "bg-amber-500";
  } else {
    if (isSelected) {
      cardBg = "bg-card border-primary shadow-[0_0_15px_rgba(var(--primary),0.1)] ring-1 ring-primary/30";
    }
  }

  return (
    <Card
      onClick={() => onClick(record.id)}
      className={`transition-all duration-300 cursor-pointer ${cardBg} h-full overflow-hidden flex flex-col ${
        isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.01]" : ""
      }`}
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
        <div className="flex-1 flex flex-col justify-center min-h-[70px]">
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
}
