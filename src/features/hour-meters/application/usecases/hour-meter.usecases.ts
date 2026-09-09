import { Either, left, right } from "../../../../core/utils/either";
import { DailyOperationsKpi, HourMeterRecord } from "../../domain/entities";
import { IHourMeterRepository, RegisterHourMeterInput } from "../../domain/repositories/hour-meter.repository";

export interface HourMeterFailure { message: string; fieldErrors?: Partial<Record<"assetId" | "capturedAt" | "currentReading" | "dieselAccumulatedGallons" | "dailyMwAccumulated" | "dailyMvarAccumulated", string>>; }
export class HourMeterRepositoryFailure implements HourMeterFailure { constructor(public readonly message: string, public readonly fieldErrors?: HourMeterFailure["fieldErrors"]) {} }

/** Retrieves all hour meters without exposing infrastructure details. */
export class GetHourMetersUseCase {
  constructor(private readonly repository: IHourMeterRepository) {}
  async execute(rigId?: string): Promise<Either<HourMeterFailure, HourMeterRecord[]>> {
    try { return right(await this.repository.getAll(rigId)); }
    catch (error: any) { return left(new HourMeterRepositoryFailure(error?.message ?? "Unable to load hour meters.")); }
  }
}

/** Retrieves the operational aggregates displayed by the right sidebar. */
export class GetDailyOperationsKpiUseCase {
  constructor(private readonly repository: import("../../domain/repositories/hour-meter.repository").IDailyOperationsKpiRepository) {}
  async execute(assetId: string): Promise<Either<HourMeterFailure, DailyOperationsKpi>> {
    try { return right(await this.repository.getLast24Hours(assetId)); }
    catch (error: any) { return left(new HourMeterRepositoryFailure(error?.message ?? "No fue posible cargar los indicadores.")); }
  }
}

/** Validates and registers one manual hour-meter reading. */
export class RegisterHourMeterUseCase {
  constructor(private readonly repository: IHourMeterRepository) {}
  async execute(input: RegisterHourMeterInput): Promise<Either<HourMeterFailure, HourMeterRecord>> {
    const fieldErrors: HourMeterFailure["fieldErrors"] = {};
    if (!input.assetId.trim()) fieldErrors.assetId = "Selecciona un equipo.";
    if (!input.capturedAt) fieldErrors.capturedAt = "Ingresa la fecha y hora.";
    if (!Number.isInteger(input.currentReading) || input.currentReading < 0) fieldErrors.currentReading = "Ingresa un número entero válido.";
    if (!Number.isInteger(input.dieselAccumulatedGallons) || input.dieselAccumulatedGallons < 0) fieldErrors.dieselAccumulatedGallons = "Ingresa un número entero válido.";
    if (!Number.isFinite(input.dailyMwAccumulated) || input.dailyMwAccumulated < 0) fieldErrors.dailyMwAccumulated = "Ingresa un valor válido.";
    if (!Number.isFinite(input.dailyMvarAccumulated) || input.dailyMvarAccumulated < 0) fieldErrors.dailyMvarAccumulated = "Ingresa un valor válido.";
    if (Object.keys(fieldErrors).length) {
      return left(new HourMeterRepositoryFailure("Revisa los campos indicados.", fieldErrors));
    }
    try {
      const previous = (await this.repository.getAll()).find((record) => record.assetId === input.assetId);
      if (previous && previous.currentReading !== null && (input.currentReading < previous.currentReading || input.dieselAccumulatedGallons < (previous.dieselAccumulatedGallons ?? 0) || input.dailyMwAccumulated < (previous.dailyMwAccumulated ?? 0) || input.dailyMvarAccumulated < (previous.dailyMvarAccumulated ?? 0))) {
        const monotonicErrors: HourMeterFailure["fieldErrors"] = {};
        if (input.currentReading < previous.currentReading) monotonicErrors.currentReading = "No puede ser menor que la última lectura.";
        if (input.dieselAccumulatedGallons < (previous.dieselAccumulatedGallons ?? 0)) monotonicErrors.dieselAccumulatedGallons = "No puede ser menor que el último valor.";
        if (input.dailyMwAccumulated < (previous.dailyMwAccumulated ?? 0)) monotonicErrors.dailyMwAccumulated = "No puede ser menor que el último valor.";
        if (input.dailyMvarAccumulated < (previous.dailyMvarAccumulated ?? 0)) monotonicErrors.dailyMvarAccumulated = "No puede ser menor que el último valor.";
        return left(new HourMeterRepositoryFailure("Las nuevas lecturas no pueden ser menores que los últimos valores registrados.", monotonicErrors));
      }
      return right(await this.repository.register(input));
    }
    catch (error: any) { return left(new HourMeterRepositoryFailure(error?.message ?? "Unable to register the reading.")); }
  }
}
