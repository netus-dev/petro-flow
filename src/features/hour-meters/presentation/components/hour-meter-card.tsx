"use client";

import { Card, CardContent } from "@/src/core/presentation/components/ui/card";
import { HourMeterRecord } from "../../domain/entities";

/**
 * Representa una versión enriquecida del registro de horómetro,
 * con campos auxiliares calculados para presentación.
 */
export interface EnhancedHourMeterRecord extends HourMeterRecord {
  functionalPrincipleName: string;
  remainingHours: number | null;
  isCritical: boolean;
  isWarning: boolean;
  isNormal: boolean;
  progressValue: number;
}

type FunctionalPrincipleAccent = { rail: string; progress: string };

const DEFAULT_ACCENT: FunctionalPrincipleAccent = { rail: "border-l-slate-400", progress: "bg-primary" };
const FUNCTIONAL_PRINCIPLE_ACCENTS: Record<string, FunctionalPrincipleAccent> = {
  "Motor de Combustión Interna": { rail: "border-l-blue-500", progress: "bg-blue-500" },
  "Bomba de Lodo": { rail: "border-l-teal-500", progress: "bg-teal-500" },
  Malacate: { rail: "border-l-indigo-500", progress: "bg-indigo-500" },
  "Top Drive": { rail: "border-l-violet-500", progress: "bg-violet-500" },
  "Bomba para Operar Preventores": { rail: "border-l-rose-500", progress: "bg-rose-500" },
  "Unidad de Potencia Hidráulica": { rail: "border-l-sky-500", progress: "bg-sky-500" },
};

/** Derives the stable visual accent from the functional-principle label. */
export function getFunctionalPrincipleAccent(name?: string): FunctionalPrincipleAccent {
  return (name ? FUNCTIONAL_PRINCIPLE_ACCENTS[name] : undefined) ?? DEFAULT_ACCENT;
}

/** Returns the badge styling and label with critical severity taking precedence. */
export function getMaintenanceBadge(record: Pick<EnhancedHourMeterRecord, "remainingHours" | "isCritical" | "isWarning">) {
  if (record.remainingHours === null) return { text: "Sin configuración", className: "text-muted-foreground bg-muted/30 border-border" };
  if (record.isCritical) {
    return {
      text: record.remainingHours <= 0 ? "Mantenimiento vencido" : "Mantenimiento Crítico",
      className: "text-orange-500 bg-orange-500/10 border-orange-500/20 animate-pulse",
    };
  }
  if (record.isWarning) return { text: "Próximo a Mantenimiento", className: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
  return { text: "Normal", className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
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
  const accent = getFunctionalPrincipleAccent(record.functionalPrincipleName);
  const badge = getMaintenanceBadge(record);
  const cardBg = "bg-card border-border/50";
  let textColor = "text-foreground";
  let severityBorder = "border-border/50";
  let progressIndicatorColor = accent.progress;

  if (record.isCritical) {
    severityBorder = "border-orange-500/70";
    textColor = "text-orange-500";
    progressIndicatorColor = "bg-orange-500";
  } else if (record.isWarning) {
    severityBorder = "border-amber-500/70";
    textColor = "text-amber-500";
    progressIndicatorColor = "bg-amber-500";
  }

  return (
    <Card
      onClick={() => onClick(record.id)}
      className={`transition-all duration-300 cursor-pointer hover:scale-[1.01] ${cardBg} ${severityBorder} ${accent.rail} h-full overflow-hidden flex flex-col border-l-4 p-0 ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.01]" : ""
        }`}
    >

      <CardContent className="p-4 flex flex-col justify-between flex-1">
        {/* Nivel 1: Encabezado compacto (Título + ID a la izquierda, Badge a la derecha) */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm md:text-base font-bold tracking-tight text-foreground truncate">
              {record.equipment}
            </h3>
            <p className="truncate text-[10px] text-muted-foreground">{record.functionalPrincipleName}</p>
          </div>

          <span className={`shrink-0 text-[9px] font-medium tracking-wider uppercase px-2 py-0.5 rounded border ${badge.className}`}>
            {badge.text}
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
            <span className="block font-bold">{record.remainingHours === null ? "Sin configuración" : record.remainingHours <= 0 ? "Mantenimiento vencido" : "Siguiente Mantto. en"}</span>
            {record.remainingHours !== null && <span className="block font-black text-sm tabular-nums">{Math.max(record.remainingHours, 0).toLocaleString("es-ES")} hrs</span>}
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
