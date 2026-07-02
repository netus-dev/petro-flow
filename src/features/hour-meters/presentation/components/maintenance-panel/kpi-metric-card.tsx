import * as React from "react";
import { ReliabilityPeriod, RELIABILITY_PERIOD_LABELS } from "../../../domain/entities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/core/presentation/components/ui/select";

export interface KpiMetricCardProps {
  /** Acrónimo o etiqueta corta del KPI (ej. MTBF, MTTR). */
  label: string;
  /** Nombre largo descriptivo (ej. Mean Time Between Failures). */
  fullName: string;
  /** Valor numérico del indicador, o null si no se puede calcular. */
  value: number | null;
  /** Unidad del valor (ej. hrs, %). */
  unit: string;
  /** Indica si la carga asíncrona está activa. */
  isLoading: boolean;
  /** Período de confiabilidad activo. Requerido solo para tarjeta de Confiabilidad. */
  period?: ReliabilityPeriod;
  /** Callback executado al cambiar el período en el dropdown. */
  onPeriodChange?: (period: ReliabilityPeriod) => void;
}

/**
 * Componente de presentación individual (Molecule) que renderiza un KPI.
 * Muestra etiquetas, valores formateados, unidades y opcionalmente un select
 * para el período de tiempo (ej. Confiabilidad). Soporta estados de carga (Skeleton).
 */
export function KpiMetricCard({
  label,
  fullName,
  value,
  unit,
  isLoading,
  period,
  onPeriodChange,
}: KpiMetricCardProps) {
  if (isLoading) {
    return (
      <div className="bg-muted/15 border border-border/30 rounded-lg p-3 h-[90px] flex flex-col justify-between animate-pulse">
        <div className="space-y-1">
          <div className="h-2.5 bg-muted rounded w-1/3"></div>
          <div className="h-2 bg-muted rounded w-2/3"></div>
        </div>
        <div className="h-5 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  const hasDropdown = period !== undefined && onPeriodChange !== undefined;

  return (
    <div className="bg-muted/30 border border-border/50 rounded-lg p-3 h-[90px] flex flex-col justify-between transition-all hover:bg-muted/40 hover:border-border/80 group">
      <div className="flex justify-between items-start gap-1">
        <div className="min-w-0">
          <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-muted-foreground block">
            {label}
          </span>
          <span className="text-[8px] text-muted-foreground/60 block truncate" title={fullName}>
            {fullName}
          </span>
        </div>
        
        {hasDropdown && (
          <div className="shrink-0 -mt-1 -mr-1">
            <Select
              value={period}
              onValueChange={(val) => onPeriodChange(val as ReliabilityPeriod)}
            >
              <SelectTrigger size="sm" className="h-5 text-[8px] font-medium font-mono border-border/60 bg-muted/40 hover:bg-muted/60 px-1.5 py-0.5 rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border/60 bg-card">
                {(Object.keys(RELIABILITY_PERIOD_LABELS) as ReliabilityPeriod[]).map((p) => (
                  <SelectItem key={p} value={p} className="text-[9px] font-mono">
                    {RELIABILITY_PERIOD_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-0.5 mt-1">
        <span className="text-lg font-black font-mono tracking-tight text-foreground leading-none">
          {value !== null ? value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : "—"}
        </span>
        {value !== null && (
          <span className="text-[9px] font-mono text-muted-foreground/80 font-bold ml-0.5">
            {unit}
          </span>
        )}
        {value === null && (
          <span className="text-[7px] font-mono text-muted-foreground/40 italic ml-1">
            Sin datos
          </span>
        )}
      </div>
    </div>
  );
}
