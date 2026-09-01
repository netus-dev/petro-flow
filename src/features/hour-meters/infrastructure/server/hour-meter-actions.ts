"use server";

import { createTenantClient } from "@/src/core/lib/supabase/server";
import { HourMeterFailure, RegisterHourMeterUseCase } from "../../application/usecases/hour-meter.usecases";
import { DailyOperationsKpi, HourMeterRecord } from "../../domain/entities";
import { RegisterHourMeterInput } from "../../domain/repositories/hour-meter.repository";
import { SupabaseHourMeterRepository } from "../repositories/hour-meter.supabase.repository";

export type HourMeterActionResult<T> = { ok: true; data: T } | { ok: false; error: string; fieldErrors?: HourMeterFailure["fieldErrors"] };

async function repository() {
  const client = await createTenantClient();
  return client ? new SupabaseHourMeterRepository(client) : null;
}

/** Reads Hourmeters only through the validated server tenant context. */
export async function readHourMeters(): Promise<HourMeterActionResult<HourMeterRecord[]>> {
  const repo = await repository();
  if (!repo) return { ok: false, error: "Tenant context is unavailable" };
  try {
    return { ok: true, data: await repo.getAll() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to load hour meters." };
  }
}

/** Registers a reading only through the validated server tenant context. */
export async function registerHourMeter(input: RegisterHourMeterInput): Promise<HourMeterActionResult<HourMeterRecord>> {
  const repo = await repository();
  if (!repo) return { ok: false, error: "Tenant context is unavailable" };
  const result = await new RegisterHourMeterUseCase(repo).execute(input);
  if (result.isLeft()) return { ok: false, error: result.value.message, fieldErrors: result.value.fieldErrors };
  return { ok: true, data: result.value };
}

/** Reads selected-asset operational deltas through the validated tenant context. */
export async function readDailyOperationsKpi(assetId: string): Promise<HourMeterActionResult<DailyOperationsKpi>> {
  const repo = await repository();
  if (!repo) return { ok: false, error: "Tenant context is unavailable" };
  try {
    return { ok: true, data: await repo.getLast24Hours(assetId) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "No fue posible cargar los indicadores." };
  }
}
