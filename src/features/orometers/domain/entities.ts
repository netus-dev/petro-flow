export type OdometerStatus = "normal" | "warning" | "critical";

export interface OdometerRecord {
  id: string;
  platform: string;
  equipment: string;
  currentReading: number;
  previousReading: number;
  unit: string;
  lastUpdated: string;
  maxThreshold: number;
  status: OdometerStatus;
}

export interface OrometerStats {
  total: number;
  normal: number;
  warning: number;
  critical: number;
  avgUsage: number;
}
