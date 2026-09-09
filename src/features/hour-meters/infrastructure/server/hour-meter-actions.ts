"use server";

import { createTenantClient } from "@/src/core/lib/supabase/server";
import { HourMeterFailure, RegisterHourMeterUseCase } from "../../application/usecases/hour-meter.usecases";
import { DailyOperationsKpi, HourMeterRecord, MaintenanceThresholdConfiguration } from "../../domain/entities";
import { RegisterHourMeterInput } from "../../domain/repositories/hour-meter.repository";
import { SupabaseHourMeterRepository } from "../repositories/hour-meter.supabase.repository";

export type HourMeterActionResult<T> = { ok: true; data: T } | { ok: false; error: string; fieldErrors?: HourMeterFailure["fieldErrors"] };

async function repository() {
  const client = await createTenantClient();
  return client ? new SupabaseHourMeterRepository(client) : null;
}

/** Reads Hourmeters only through the validated server tenant context. */
export async function readHourMeters(rigId?: string): Promise<HourMeterActionResult<HourMeterRecord[]>> {
  const repo = await repository();
  if (!repo) return { ok: false, error: "Tenant context is unavailable" };
  try {
    const scopeClient = await createTenantClient();
    if (!scopeClient) return { ok: false, error: "Tenant context is unavailable" };
    if (!("rpc" in scopeClient)) return { ok: true, data: await repo.getAll(rigId) };
    const { data: scope, error: scopeError } = await scopeClient.rpc("rbac_user_rig_scope");
    if (scopeError || !scope?.assigned) return { ok: false, error: "Operational scope is unavailable." };
    const allowed = (scope.rigs ?? []) as Array<{ id: string }>;
    const selected = rigId ?? allowed[0]?.id;
    if (!selected || !allowed.some((rig) => rig.id === selected)) return { ok: false, error: "The selected Rig is not authorized." };
    return { ok: true, data: await repo.getAll(selected) };
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

export async function readMaintenanceThresholds(principleId: string): Promise<HourMeterActionResult<MaintenanceThresholdConfiguration[]>> {
  const client = await createTenantClient(); if (!client) return { ok: false, error: "Tenant context is unavailable" };
  try { const { data: company, error: companyError } = await client.rpc("rbac_request_company_id"); if (companyError || !company) return { ok: false, error: "Tenant context is unavailable" }; return { ok: true, data: await new SupabaseHourMeterRepository(client).getThresholds(company, principleId) }; }
  catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Unable to load thresholds." }; }
}

export async function saveMaintenanceThresholds(principleId: string, thresholds: number[]): Promise<HourMeterActionResult<MaintenanceThresholdConfiguration[]>> {
  const client = await createTenantClient(); if (!client) return { ok: false, error: "Tenant context is unavailable" };
  try { const { data: company, error } = await client.rpc("rbac_request_company_id"); if (error || !company) return { ok: false, error: "Tenant context is unavailable" }; return { ok: true, data: await new SupabaseHourMeterRepository(client).saveThresholds(company, principleId, thresholds) }; }
  catch (failure) { return { ok: false, error: failure instanceof Error ? failure.message : "Unable to save thresholds." }; }
}
