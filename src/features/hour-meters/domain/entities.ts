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
