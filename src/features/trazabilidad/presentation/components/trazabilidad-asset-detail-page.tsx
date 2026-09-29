"use client";
import { useRouter } from "next/navigation";
import { Asset } from "../../domain/entities";
import { AssetDetail } from "./asset-detail";
import { addTrazabilidadCertificates, disableTrazabilidadAsset, editTrazabilidadAsset, registerTrazabilidadReplacement } from "../../infrastructure/server/trazabilidad-actions";

export function TrazabilidadAssetDetailPage({ asset }: { asset: Asset }) {
  const router = useRouter();
  const refresh = () => router.refresh();
  return <div className="p-6"><AssetDetail asset={asset} onBack={() => router.push("/trazabilidad/assets")}
    onAddCertificate={async (id, certificates) => { await addTrazabilidadCertificates(id, certificates); refresh(); }}
    onEditAsset={async (id, value) => { await editTrazabilidadAsset(id, value); refresh(); }}
    onDisableAsset={async (id) => { await disableTrazabilidadAsset(id); refresh(); }}
    onRegisterReplacement={async (payload) => { await registerTrazabilidadReplacement(payload); refresh(); }} /></div>;
}
