export type HourMeterStatus = "normal" | "warning" | "critical";

export interface HourMeterRecord {
  id: string;
  assetId: string;
  platform: string;
  equipment: string;
  currentReading: number | null;
  previousReading: number | null;
  unit: string;
  lastUpdated: string | null;
  maxThreshold: number;
  status: HourMeterStatus;
  lastMaintenanceDate: string | null;
  lastMaintenanceReading: number | null;
  dieselAccumulatedGallons: number | null;
  dailyMwAccumulated: number | null;
  dailyMvarAccumulated: number | null;
  rigId?: string;
  rigName?: string;
}

export interface DailyOperationsKpi {
  dieselGallons: number | null;
  generatedMw: number | null;
  lastUpdated: string;
}

/** Calculates consumption from two consecutive accumulated readings. */
export function calculateOperationalDeltas(previous: Pick<HourMeterRecord, "dieselAccumulatedGallons" | "dailyMwAccumulated"> | null, current: Pick<HourMeterRecord, "dieselAccumulatedGallons" | "dailyMwAccumulated">): DailyOperationsKpi {
  return {
    dieselGallons: previous?.dieselAccumulatedGallons == null || current.dieselAccumulatedGallons == null ? null : current.dieselAccumulatedGallons - previous.dieselAccumulatedGallons,
    generatedMw: previous?.dailyMwAccumulated == null || current.dailyMwAccumulated == null ? null : current.dailyMwAccumulated - previous.dailyMwAccumulated,
    lastUpdated: new Date().toISOString(),
  };
}

/** Branding displayed for the client associated with the current session. */
export interface ClientBranding {
  clientId: string;
  clientName: string;
  logoUrl?: string;
}

/** Inventory assigned to one physical asset. Availability is derived in domain. */
export interface AssetInventoryItem {
  id: string;
  assetId: string;
  material: string;
  specification: string;
  quantityInStock: number;
  minimumStock: number;
  scope: "asset" | "shared_equipment_type";
  equipmentType: string;
}

export type InventoryAvailability = "sufficient" | "critical" | "out_of_stock";

/** Calculates stock availability without coupling consumers to threshold rules. */
export function getInventoryAvailability(item: Pick<AssetInventoryItem, "quantityInStock" | "minimumStock">): InventoryAvailability {
  if (item.quantityInStock <= 0) return "out_of_stock";
  return item.quantityInStock <= item.minimumStock ? "critical" : "sufficient";
}

export interface HourMeterStats {
  total: number;
  normal: number;
  warning: number;
  critical: number;
  avgUsage: number;
}

/**
 * Categorías de actividades de mantenimiento.
 */
export type MaintenanceCategory =
  | "lubricacion"
  | "inspeccion"
  | "sustitucion"
  | "calibracion"
  | "limpieza"
  | "otro";

/**
 * Representa una actividad o tarea individual de mantenimiento.
 */
export interface MaintenanceActivity {
  id: string;
  name: string;
  description: string;
  estimatedDuration?: string;
  category: MaintenanceCategory;
}

/**
 * Representa un plan de mantenimiento para un activo.
 * Puede basarse en intervalos cíclicos o umbrales fijos puntuales.
 */
export interface MaintenancePlan {
  id: string;
  equipmentId: string;
  intervalHours?: number;
  fixedThresholdHours?: number;
  activities: MaintenanceActivity[];
}

/**
 * Resultado del cálculo del próximo mantenimiento para un activo.
 * Contiene el umbral más próximo calculado y la lista fusionada de actividades correspondientes.
 */
export interface ResolvedMaintenancePlan {
  equipmentId: string;
  equipmentName: string;
  currentReading: number;
  nextThresholdHours: number;
  activities: MaintenanceActivity[];
  planType: "cyclic" | "fixed" | "merged";
}

/**
 * Período de tiempo sobre el cual se evalúa la confiabilidad del activo.
 */
export type ReliabilityPeriod = "1w" | "1m" | "3m";

/**
 * Mapa de horas para cada período de confiabilidad soportado.
 */
export const RELIABILITY_PERIOD_HOURS: Record<ReliabilityPeriod, number> = {
  "1w": 168,    // 7 días × 24h
  "1m": 720,    // 30 días × 24h
  "3m": 2160,   // 90 días × 24h
};

/**
 * Etiquetas para mostrar en el Dropdown de período de confiabilidad.
 */
export const RELIABILITY_PERIOD_LABELS: Record<ReliabilityPeriod, string> = {
  "1w": "1 semana",
  "1m": "1 mes",
  "3m": "3 meses",
};

/**
 * Datos de KPI calculados para un activo. Todos los valores son el
 * resultado de cálculos sobre el historial de fallas del equipo.
 */
export interface EquipmentKpi {
  /** Identificador del activo al que pertenecen los KPIs. */
  assetId: string;
  /**
   * Mean Time Between Failures en horas.
   * null si el activo no tiene historial de fallas suficiente.
   */
  mtbf: number | null;
  /**
   * Mean Time To Repair en horas.
   * null si el activo no tiene registros de reparación.
   */
  mttr: number | null;
  /**
   * Disponibilidad operacional en porcentaje [0–100].
   * Calculada como: 100 × (1 − Horas_Falla_mes / Horas_Totales_mes).
   * null si no hay datos del mes en curso.
   */
  availability: number | null;
  /**
   * Mapa de confiabilidad calculada por período.
   * Fórmula: R(t) = e^(-t/MTBF) × 100, donde t en horas según el período.
   * null para un período si MTBF es null o no hay datos suficientes.
   */
  reliability: Record<ReliabilityPeriod, number | null>;
}

/**
 * Evento histórico de falla de un activo.
 * Fuente primaria para el cálculo de MTBF, MTTR y Disponibilidad.
 */
export interface FailureEvent {
  /** Identificador único del evento de falla. */
  id: string;
  /** Identificador del activo afectado. */
  assetId: string;
  /** Timestamp ISO 8601 de inicio de la falla. */
  failureStart: string;
  /** Timestamp ISO 8601 de fin de reparación. */
  repairEnd: string;
  /** Duración total de la reparación (MTTR contribution) en horas. */
  repairHours: number;
}
