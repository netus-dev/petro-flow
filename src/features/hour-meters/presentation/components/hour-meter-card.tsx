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
      className={`transition-all duration-300 cursor-pointer ${cardBg} h-full overflow-hidden flex flex-col p-0 ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.01]" : ""
        }`}
    >

      <CardContent className="p-4 flex flex-col justify-between h-full">
        {/* Nivel 1: Encabezado compacto (Título + ID a la izquierda, Badge a la derecha) */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm md:text-base font-bold tracking-tight text-foreground truncate">
              {record.equipment}
            </h3>
          </div>

          <span className={`shrink-0 text-[9px] font-medium tracking-wider uppercase px-2 py-0.5 rounded border ${record.isWarning
            ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
            : record.isCritical
              ? "text-orange-500 bg-orange-500/10 border-orange-500/20 animate-pulse"
              : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            }`}>
            {badgeText}
          </span>
        </div>

        {/* Nivel 2: Métricas Principales en 2 columnas (Lectura Actual vs Horas Restantes) */}
        <div className="grid grid-cols-2 gap-2 py-1 my-auto items-baseline">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground block">
              Lectura Actual
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl md:text-3xl font-black font-mono tabular-nums tracking-tight text-foreground">
                {record.currentReading.toLocaleString()}
              </span>
              <span className="text-xs font-mono font-bold text-muted-foreground">h</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground block">
              Faltan
            </span>
            <div className="flex items-baseline justify-end gap-1 mt-0.5">
              <span className={`text-xl md:text-2xl font-black font-mono tabular-nums tracking-tight ${textColor}`}>
                {record.remainingHours.toLocaleString()}
              </span>
              <span className={`text-xs font-mono font-bold ${textColor}`}>h</span>
            </div>
          </div>
        </div>

        {/* Nivel 3: Indicador de progreso consolidado con el Límite */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[10px] font-mono tracking-wider text-muted-foreground">
            <span>Progreso ({Math.round(record.progressValue)}%)</span>
            <span>Límite: <strong className="text-foreground">{record.maxThreshold.toLocaleString()}h</strong></span>
          </div>
          <div className="h-2 w-full bg-secondary/60 overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${progressIndicatorColor}`}
              style={{ width: `${record.progressValue}%` }}
            />
          </div>
        </div>
      </CardContent>

    </Card>
  );
}
