import { notFound } from "next/navigation";
import { getTrazabilidadAsset } from "@/src/features/trazabilidad/infrastructure/server/trazabilidad-actions";
import { TrazabilidadAssetDetailPage } from "@/src/features/trazabilidad/presentation/components/trazabilidad-asset-detail-page";

export default async function AssetDetailPage({ params }: { params: Promise<{ assetId: string }> }) {
  const asset = await getTrazabilidadAsset((await params).assetId);
  if (!asset) notFound();
  return <TrazabilidadAssetDetailPage asset={asset} />;
}
