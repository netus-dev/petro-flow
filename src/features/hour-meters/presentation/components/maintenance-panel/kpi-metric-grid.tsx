import * as React from "react";
import { EquipmentKpi, ReliabilityPeriod } from "../../../domain/entities";
import { KpiMetricCard } from "./kpi-metric-card";

export interface KpiMetricGridProps {
  /** Datos de KPI calculados para el activo. */
  kpi: EquipmentKpi | null;
  /** Indica si la resolución asíncrona está cargando datos. */
  isLoading: boolean;
  /** Período seleccionado para la métrica de Confiabilidad. */
  reliabilityPeriod: ReliabilityPeriod;
  /** Callback executado al cambiar el período en la tarjeta de Confiabilidad. */
  onReliabilityPeriodChange: (period: ReliabilityPeriod) => void;
}

/**
 * Componente de presentación (Organism) que agrupa las 4 tarjetas KPI en una grilla.
 * Organiza los KPIs en:
 * - Fila 1: MTBF (izq) y MTTR (der)
 * - Fila 2: Disponibilidad (izq) y Confiabilidad (der)
 * Responsivo: Colapsa a 1 columna en móviles, mantiene 2 columnas en md y superior.
 */
export function KpiMetricGrid({
  kpi,
  isLoading,
  reliabilityPeriod,
  onReliabilityPeriodChange,
}: KpiMetricGridProps) {
  const mtbf = kpi?.mtbf ?? null;
  const mttr = kpi?.mttr ?? null;
  const availability = kpi?.availability ?? null;
  
  // Resuelve el porcentaje de confiabilidad específico según el período seleccionado
  const reliabilityValue = kpi?.reliability ? kpi.reliability[reliabilityPeriod] : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
      <KpiMetricCard
        label="MTBF"
        fullName="Tiempo Medio Entre Fallas"
        value={mtbf}
        unit="hrs"
        isLoading={isLoading}
      />
      <KpiMetricCard
        label="MTTR"
        fullName="Tiempo Medio De Reparación"
        value={mttr}
        unit="hrs"
        isLoading={isLoading}
      />
      <KpiMetricCard
        label="Disponibilidad"
        fullName="Disponibilidad Operacional"
        value={availability}
        unit="%"
        isLoading={isLoading}
      />
      <KpiMetricCard
        label="Confiabilidad"
        fullName="Probabilidad de No Falla"
        value={reliabilityValue}
        unit="%"
        isLoading={isLoading}
        period={reliabilityPeriod}
        onPeriodChange={onReliabilityPeriodChange}
      />
    </div>
  );
}
