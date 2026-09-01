import { HourMeterRecord, HourMeterStatus } from "../../domain/entities";
import { RegisterHourMeterInput } from "../../domain/repositories/hour-meter.repository";

type HourMeterDto = Omit<HourMeterRecord, "status"> & { status?: string };

/** Maps infrastructure records into the stable hour-meter domain model. */
export function toHourMeterRecord(dto: HourMeterDto): HourMeterRecord {
  const usage = dto.currentReading === null ? 0 : dto.currentReading / dto.maxThreshold;
  const status: HourMeterStatus = usage > 0.9 ? "critical" : usage > 0.75 ? "warning" : "normal";
  return { ...dto, status };
}

export function toHourMeterDto(input: RegisterHourMeterInput, id: string): HourMeterDto {
  return {
    id,
    platform: "Plataforma Norte",
    assetId: input.assetId,
    equipment: input.assetId,
    currentReading: input.currentReading,
    previousReading: Math.round(input.currentReading * 0.95),
    unit: "hrs",
    lastUpdated: input.capturedAt,
    maxThreshold: 5000,
    lastMaintenanceDate: null,
    lastMaintenanceReading: Math.round(input.currentReading * 0.9),
    dieselAccumulatedGallons: input.dieselAccumulatedGallons,
    dailyMwAccumulated: input.dailyMwAccumulated,
    dailyMvarAccumulated: input.dailyMvarAccumulated,
  };
}
