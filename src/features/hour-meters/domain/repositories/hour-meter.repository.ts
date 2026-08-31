import { HourMeterRecord } from "../entities";

export interface RegisterHourMeterInput {
  equipmentId: string;
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

export interface IDailyOperationsKpiRepository {
  getLast24Hours(): Promise<import("../entities").DailyOperationsKpi>;
}
