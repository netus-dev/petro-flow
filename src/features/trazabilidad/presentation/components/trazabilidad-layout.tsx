"use client";

import { Database, LayoutDashboard, Route, Shuffle } from "lucide-react";
import { RegisterBatchMovementModal } from "./register-batch-movement-modal";
import { registerTrazabilidadBulkMovement } from "../../infrastructure/server/trazabilidad-actions";
import { ModuleHeader } from "@/src/core/presentation/components/layout/module-header";
import { Button } from "@/src/core/presentation/components/ui/button";

const navigation = [
  { href: "/trazabilidad", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/trazabilidad/assets", label: "Listado de Activos", icon: Database },
  { href: "/trazabilidad/movements", label: "Listado de Movimientos", icon: Route },
] as const;

/** Shared module shell for the Trazabilidad route tree. */
export function TrazabilidadLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <ModuleHeader
        title="Trazabilidad de Activos"
        icon={Route}
        navigation={navigation}
        actions={<RegisterBatchMovementModal onRegister={registerTrazabilidadBulkMovement} trigger={<Button variant="secondary" size="icon-sm" aria-label="Registrar movimiento"><Shuffle className="size-4" /></Button>} />}
      />
      <main className="px-6">{children}</main>
    </div>
  );
}
