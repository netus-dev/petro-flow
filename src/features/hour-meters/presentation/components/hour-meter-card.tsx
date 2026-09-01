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

/** Formats maintenance dates for the Spanish card presentation. */
function formatMaintenanceDate(date: string | null): string {
  return date ? new Date(date).toLocaleDateString("es-ES") : "Sin registro";
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
    const eqName = record.equipment.toLowerCase();
    if (eqName.includes("generador")) {
      cardBg = "bg-blue-100/80 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/30 dark:border-blue-800/60";
      progressIndicatorColor = "bg-blue-500";
    } else if (eqName.includes("bomba de lodo")) {
      cardBg = "bg-teal-100/80 border-teal-300 hover:bg-teal-200 dark:bg-teal-900/30 dark:border-teal-800/60";
      progressIndicatorColor = "bg-teal-500";
    } else if (eqName.includes("malacate")) {
      cardBg = "bg-indigo-100/80 border-indigo-300 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800/60";
      progressIndicatorColor = "bg-indigo-500";
    } else if (eqName.includes("hpu")) {
      cardBg = "bg-sky-100/80 border-sky-300 hover:bg-sky-200 dark:bg-sky-900/30 dark:border-sky-800/60";
      progressIndicatorColor = "bg-sky-500";
    } else if (eqName.includes("koomey")) {
      cardBg = "bg-rose-100/80 border-rose-300 hover:bg-rose-200 dark:bg-rose-900/30 dark:border-rose-800/60";
      progressIndicatorColor = "bg-rose-500";
    }

    if (isSelected) {
      cardBg += " border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)] ring-2 ring-primary/40";
    }
  }

  return (
    <Card
      onClick={() => onClick(record.id)}
      className={`transition-all duration-300 cursor-pointer ${cardBg} h-full overflow-hidden flex flex-col p-0 ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.01]" : ""
        }`}
    >

      <CardContent className="p-4 flex flex-col justify-between flex-1">
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

        {/* Nivel 2: contexto histórico y lectura actual destacada */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 py-3 my-auto">
          <div className="min-w-0 text-[10px] font-mono leading-relaxed text-muted-foreground">
            <span className="block">Último mantto:</span>
            <span className="block">{formatMaintenanceDate(record.lastMaintenanceDate)}</span>
            <span className="block">{record.lastMaintenanceReading === null ? "Sin registro" : `${record.lastMaintenanceReading.toLocaleString("es-ES")} hrs`}</span>
          </div>

          <div className="text-center">
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground block">
              Lectura actual
            </span>
            <div className="flex items-baseline justify-center gap-1 mt-0.5">
              <span className="text-3xl md:text-4xl font-black font-mono tabular-nums tracking-tight text-foreground">
                {record.currentReading === null ? "Sin lecturas" : record.currentReading.toLocaleString()}
              </span>
              <span className="text-xs font-mono font-bold text-muted-foreground">hrs</span>
            </div>
          </div>

          <div className={`text-right text-[10px] font-mono ${textColor}`}>
            <span className="block font-bold">{record.remainingHours <= 0 ? "Mantenimiento vencido" : "Siguiente Mantto. en"}</span>
            <span className="block font-black text-sm tabular-nums">{Math.max(record.remainingHours, 0).toLocaleString("es-ES")} hrs</span>
          </div>
        </div>

      </CardContent>

      {/* Nivel 3: Indicador de progreso integrado al borde inferior de la tarjeta */}
      <div className="shrink-0 space-y-1 px-4 pt-1 pb-1">
        <div className="flex justify-between text-[10px] font-mono tracking-wider text-muted-foreground">
          <span>Progreso ({Math.round(record.progressValue)}%)</span>
          <span>Límite: <strong className="text-foreground">{record.maxThreshold.toLocaleString()} hrs</strong></span>
        </div>
      </div>
      <div className="shrink-0 h-1 w-full bg-secondary/60 overflow-hidden rounded-b-xl">
        <div
          className={`h-full transition-all duration-1000 ease-out ${progressIndicatorColor}`}
          style={{ width: `${record.progressValue}%` }}
        />
      </div>

    </Card>
  );
}
