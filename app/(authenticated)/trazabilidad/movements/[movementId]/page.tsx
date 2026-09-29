import { notFound } from "next/navigation";
import { getTrazabilidadMovement } from "@/src/features/trazabilidad/infrastructure/server/trazabilidad-actions";
import { MovementDetail } from "@/src/features/trazabilidad/presentation/components/movement-detail";

export default async function MovementDetailPage({ params }: { params: Promise<{ movementId: string }> }) {
  const movement = await getTrazabilidadMovement((await params).movementId);
  if (!movement) notFound();
  return <div className="p-6"><MovementDetail movement={movement} onBack={() => {}} /></div>;
}
