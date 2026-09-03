"use server";

import { createTenantClient } from "@/src/core/lib/supabase/server";

/** Uploads a certificate and records its tenant-owned metadata atomically at the application boundary. */
export async function uploadCertificateAction(file: File, name: string, assetId?: string): Promise<string> {
  const client = await createTenantClient();
  if (!client) throw new Error("Tenant context is unavailable");

  const [{ data: userData, error: userError }, { data: companyId, error: companyError }] = await Promise.all([
    client.auth.getUser(),
    client.rpc("rbac_request_company_id"),
  ]);
  if (userError || !userData.user) throw userError ?? new Error("No user authenticated");
  if (companyError || !companyId) throw companyError ?? new Error("Tenant context is unavailable");

  const id = crypto.randomUUID();
  const extension = file.name.split(".").pop() || "";
  const storagePath = `${id}.${extension}`;
  const { error: uploadError } = await client.storage.from("certificates").upload(storagePath, file);
  if (uploadError) throw uploadError;

  const { error: metadataError } = await client.from("certificates").insert({
    id,
    company_id: companyId,
    uploaded_by: userData.user.id,
    storage_path: storagePath,
    file_name: name,
    mime_type: file.type || "application/octet-stream",
  });
  if (metadataError) throw metadataError;
  if (assetId) {
    const { error: linkError } = await client.from("assets_certificates").insert({ asset_id: assetId, certificate_id: id, company_id: companyId });
    if (linkError) throw linkError;
  }
  return id;
}
