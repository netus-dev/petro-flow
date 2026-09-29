"use server";

import { createTenantClient } from "@/src/core/lib/supabase/server";
import { SupabaseTrazabilidadRepository } from "../supabase-repository";
import {
  AddCertificateUseCase,
  DisableAssetUseCase,
  EditAssetUseCase,
  GetAssetByIdUseCase,
  GetAssetStatsUseCase,
  GetAssetsUnderInspectionUseCase,
  GetFunctionalPrinciplesUseCase,
  RegisterAssetUseCase,
  RegisterBulkMovementUseCase,
  RegisterMovementUseCase,
  RegisterReplacementUseCase,
  GetMovementListUseCase,
  GetMovementByIdUseCase,
} from "../../application/use-cases";
import { Asset, AssetMovementPayload } from "../../domain/entities";

async function getRepository() {
  const client = await createTenantClient();
  if (!client) throw new Error("Tenant context is unavailable");
  return new SupabaseTrazabilidadRepository(client);
}

export async function getTrazabilidadDashboardStats() {
  return (await getRepository()).getDashboardStats();
}

export async function getTrazabilidadAssets() {
  return (await getRepository()).getAssetList();
}

export async function getTrazabilidadMovements() {
  return new GetMovementListUseCase(await getRepository()).execute();
}

export async function getTrazabilidadMovement(id: string) {
  return new GetMovementByIdUseCase(await getRepository()).execute(id);
}

export async function getTrazabilidadAsset(id: string) {
  return new GetAssetByIdUseCase(await getRepository()).execute(id);
}

export async function registerTrazabilidadMovement(assetId: string, movement: unknown) {
  return new RegisterMovementUseCase(await getRepository()).execute(assetId, movement);
}

export async function registerTrazabilidadBulkMovement(payload: AssetMovementPayload) {
  return new RegisterBulkMovementUseCase(await getRepository()).execute(payload);
}

export async function registerTrazabilidadReplacement(payload: unknown) {
  return new RegisterReplacementUseCase(await getRepository()).execute(payload);
}

export async function addTrazabilidadCertificates(assetId: string, certificates: { file: File; name: string }[]) {
  return new AddCertificateUseCase(await getRepository()).execute(assetId, certificates);
}

export async function registerTrazabilidadAsset(asset: Partial<Asset>) {
  return new RegisterAssetUseCase(await getRepository()).execute(asset);
}

export async function editTrazabilidadAsset(id: string, asset: Partial<Asset>) {
  return new EditAssetUseCase(await getRepository()).execute(id, asset);
}

export async function disableTrazabilidadAsset(id: string) {
  return new DisableAssetUseCase(await getRepository()).execute(id);
}

export async function getTrazabilidadDashboardData() {
  const repository = await getRepository();
  const principles = await new GetFunctionalPrinciplesUseCase(repository).execute();
  const stats = principles.length > 0
    ? await new GetAssetStatsUseCase(repository).execute(principles[0].id)
    : [];
  return { principles, stats };
}

export async function getTrazabilidadAssetStats(id: string) {
  return new GetAssetStatsUseCase(await getRepository()).execute(id);
}

export async function getTrazabilidadAssetsUnderInspection() {
  return new GetAssetsUnderInspectionUseCase(await getRepository()).execute();
}
