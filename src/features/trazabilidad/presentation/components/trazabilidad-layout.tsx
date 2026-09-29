"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, LayoutDashboard, Route } from "lucide-react";
import { RegisterBatchMovementModal } from "./register-batch-movement-modal";
import { registerTrazabilidadBulkMovement } from "../../infrastructure/server/trazabilidad-actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/core/presentation/components/ui/breadcrumb";

const navigation = [
  { href: "/trazabilidad", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trazabilidad/assets", label: "Listado de Activos", icon: Database },
  { href: "/trazabilidad/movements", label: "Listado de Movimientos", icon: Route },
] as const;

/** Shared module shell for the Trazabilidad route tree. */
export function TrazabilidadLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-1 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
            <Route className="size-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-tight">Trazabilidad de Activos</h1>
        </div>
        <Breadcrumb>
          <BreadcrumbList className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">
            <BreadcrumbItem><BreadcrumbLink href="/dashboard">Inicio</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Trazabilidad</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center justify-between gap-4">
      <nav className="flex w-fit items-center gap-2 rounded-lg border border-border bg-secondary/20 p-1">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = href === "/trazabilidad"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              className={`flex h-8 items-center gap-2 rounded-md px-4 text-xs ${active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
              href={href}
            >
              <Icon className="size-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <RegisterBatchMovementModal onRegister={registerTrazabilidadBulkMovement} />
      </div>
      {children}
    </div>
  );
}
