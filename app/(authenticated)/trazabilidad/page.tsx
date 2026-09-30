import { TrazabilidadContent } from "@/src/features/trazabilidad/presentation/components/trazabilidad-content";
import { getTrazabilidadDashboardStats } from "@/src/features/trazabilidad/infrastructure/server/trazabilidad-actions";

export default async function TrazabilidadPage() {
  return <TrazabilidadContent stats={await getTrazabilidadDashboardStats()} />;
}
