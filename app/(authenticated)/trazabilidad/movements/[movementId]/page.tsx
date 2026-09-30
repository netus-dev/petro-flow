import { notFound } from "next/navigation";
import { getTrazabilidadMovement } from "@/src/features/trazabilidad/infrastructure/server/trazabilidad-actions";
import { TrazabilidadMovementDetailPage } from "@/src/features/trazabilidad/presentation/components/trazabilidad-movement-detail-page";

export default async function MovementDetailPage({ params }: { params: Promise<{ movementId: string }> }) {
  const movement = await getTrazabilidadMovement((await params).movementId);
  if (!movement) notFound();
  return <TrazabilidadMovementDetailPage movement={movement} />;
}
