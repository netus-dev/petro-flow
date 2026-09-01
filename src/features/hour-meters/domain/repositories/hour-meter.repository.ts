import { HourMeterRecord } from "../entities";

export interface RegisterHourMeterInput {
  assetId: string;
  capturedAt: string;
  currentReading: number;
  dieselAccumulatedGallons: number;
  dailyMwAccumulated: number;
  dailyMvarAccumulated: number;
}

/** Provides hour-meter reads and manual registrations to the application layer. */
export interface IHourMeterRepository {
  getAll(): Promise<HourMeterRecord[]>;
  register(input: RegisterHourMeterInput): Promise<HourMeterRecord>;
}

export interface HourMeterRepositoryOptions {
  initialRecords?: HourMeterRecord[];
}

export interface IDailyOperationsKpiRepository {
  getLast24Hours(assetId: string): Promise<import("../entities").DailyOperationsKpi>;
}
