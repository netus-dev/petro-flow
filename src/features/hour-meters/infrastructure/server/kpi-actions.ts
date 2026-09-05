"use server";

import { createTenantClient } from "@/src/core/lib/supabase/server";
import { GetEquipmentKpiUseCase } from "../../application/usecases/kpi.usecases";
import { EquipmentKpi } from "../../domain/entities";
import { createKpiRepository } from "../repository";

/** Loads equipment KPIs through the validated tenant-scoped server client. */
export async function readEquipmentKpi(assetId: string): Promise<{ ok: true; data: EquipmentKpi | null } | { ok: false; error: string }> {
  const client = await createTenantClient();
  if (!client) return { ok: false, error: "Tenant context is unavailable" };
  const result = await new GetEquipmentKpiUseCase(createKpiRepository(client)).execute(assetId);
  return result.isRight() ? { ok: true, data: result.value } : { ok: false, error: result.value.message };
}
