"use client";

import { useRouter } from "next/navigation";
import { Movement } from "../../domain/entities";
import { MovementDetail } from "./movement-detail";

/** Client boundary for movement-detail navigation actions. */
export function TrazabilidadMovementDetailPage({ movement }: { movement: Movement }) {
  const router = useRouter();

  return (
    <div className="p-6">
      <MovementDetail movement={movement} onBack={() => router.push("/trazabilidad/movements")} />
    </div>
  );
}
