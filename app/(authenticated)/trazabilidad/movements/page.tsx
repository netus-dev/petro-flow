import { getTrazabilidadMovements } from "@/src/features/trazabilidad/infrastructure/server/trazabilidad-actions";
import { TrazabilidadMovementsPage } from "@/src/features/trazabilidad/presentation/components/trazabilidad-movements-page";

export default async function MovementsPage() {
  return <TrazabilidadMovementsPage movements={await getTrazabilidadMovements()} />;
}
