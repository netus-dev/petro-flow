"use client";

import { Database, LayoutDashboard, Route, Shuffle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { RegisterAssetModal } from "./register-asset-modal";
import { RegisterBatchMovementModal } from "./register-batch-movement-modal";
import {
  registerTrazabilidadAsset,
  registerTrazabilidadBulkMovement,
} from "../../infrastructure/server/trazabilidad-actions";
import { ModuleHeader } from "@/src/core/presentation/components/layout/module-header";
import { ModuleShell } from "@/src/core/presentation/components/layout/module-shell";
import { Button } from "@/src/core/presentation/components/ui/button";

const navigation = [
  { href: "/trazabilidad", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/trazabilidad/assets", label: "Listado de Activos", icon: Database },
  { href: "/trazabilidad/movements", label: "Listado de Movimientos", icon: Route },
] as const;

/** Shared module shell for the Trazabilidad route tree. */
export function TrazabilidadLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAssetsRoute =
    pathname === "/trazabilidad/assets" ||
    pathname.startsWith("/trazabilidad/assets/");

  return (
    <ModuleShell
      contentClassName="px-6"
      header={
        <ModuleHeader
          title="Trazabilidad de Activos"
          icon={Route}
          navigation={navigation}
          actions={
            <>
              {isAssetsRoute ? (
                <RegisterAssetModal
                  onRegister={async (asset) => {
                    await registerTrazabilidadAsset(asset);
                    router.refresh();
                  }}
                />
              ) : null}
              <RegisterBatchMovementModal
                onRegister={registerTrazabilidadBulkMovement}
                trigger={
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    aria-label="Registrar movimiento"
                  >
                    <Shuffle className="size-4" />
                  </Button>
                }
              />
            </>
          }
        />
      }
    >
      {children}
    </ModuleShell>
  );
}
