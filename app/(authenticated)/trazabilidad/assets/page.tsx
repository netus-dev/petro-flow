import { getTrazabilidadAssets } from "@/src/features/trazabilidad/infrastructure/server/trazabilidad-actions";
import { TrazabilidadAssetsPage } from "@/src/features/trazabilidad/presentation/components/trazabilidad-assets-page";

export default async function AssetsPage() {
  return <TrazabilidadAssetsPage assets={await getTrazabilidadAssets()} />;
}
