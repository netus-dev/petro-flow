export type HourMeterStatus = "normal" | "warning" | "critical";

export interface HourMeterRecord {
  id: string;
  platform: string;
  equipment: string;
  currentReading: number;
  previousReading: number;
  unit: string;
  lastUpdated: string;
  maxThreshold: number;
  status: HourMeterStatus;
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
