"use client";

import {
  CheckCircle2,
  Loader2,
  Circle,
  MapPin,
  Wrench,
  Truck,
  Building2,
  Package,
} from "lucide-react";
import { Badge } from "@/src/core/presentation/components/ui/badge";
import type { JourneyStop, StopStatus } from "../../domain/entities";

function getStatusIcon(status: StopStatus, index: number, total: number) {
  if (status === "completed")
    return <CheckCircle2 className="size-5 text-emerald-500" />;
  if (status === "in-progress")
    return <Loader2 className="size-5 text-primary animate-spin" />;
  return <Circle className="size-5 text-muted-foreground" />;
}

function getServiceIcon(service: string) {
  const lower = service.toLowerCase();
  if (lower.includes("transporte") || lower.includes("grua"))
    return <Truck className="size-4" />;
  if (
    lower.includes("reparacion") ||
    lower.includes("reemplazo") ||
    lower.includes("inspeccion") ||
    lower.includes("calibracion") ||
    lower.includes("cambio")
  )
    return <Wrench className="size-4" />;
  if (
    lower.includes("almacen") ||
    lower.includes("recepcion") ||
    lower.includes("despacho")
  )
    return <Package className="size-4" />;
  if (lower.includes("reinstalacion") || lower.includes("plataforma"))
    return <Building2 className="size-4" />;
  return <MapPin className="size-4" />;
}

function getStatusBadge(status: StopStatus) {
  if (status === "completed")
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/30 text-emerald-500 text-[9px] tracking-wider uppercase"
      >
        Completado
      </Badge>
    );
  if (status === "in-progress")
    return (
      <Badge
        variant="outline"
        className="border-primary/30 text-primary text-[9px] tracking-wider uppercase"
      >
        En Proceso
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="border-muted-foreground/30 text-muted-foreground text-[9px] tracking-wider uppercase"
    >
      Pendiente
    </Badge>
  );
}

export function EquipmentJourneyMap({ journey }: { journey: JourneyStop[] }) {
  return (
    <div className="relative flex flex-col gap-0 py-2">
      {journey.map((stop, index) => {
        const isLast = index === journey.length - 1;
        const isActive = stop.status === "in-progress";

        return (
          <div key={stop.id} className="relative flex gap-4">
            {/* Vertical line + node */}
            <div className="flex flex-col items-center shrink-0 w-10">
              {/* The node */}
              <div
                className={`relative z-10 flex items-center justify-center size-10 rounded-full border-2 transition-all ${
                  stop.status === "completed"
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : stop.status === "in-progress"
                      ? "border-primary/50 bg-primary/10 shadow-[0_0_16px_rgba(var(--primary),0.15)]"
                      : "border-border bg-secondary/50"
                }`}
              >
                {getStatusIcon(stop.status, index, journey.length)}
              </div>
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-8 ${
                    stop.status === "completed"
                      ? "bg-emerald-500/30"
                      : stop.status === "in-progress"
                        ? "bg-linear-to-b from-primary/40 to-border"
                        : "bg-border"
                  }`}
                />
              )}
            </div>

            {/* Content card */}
            <div
              className={`flex-1 mb-4 rounded-lg border p-4 transition-all ${
                isActive
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              {/* Provider header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center size-7 rounded-md ${
                      isActive ? "bg-primary/10" : "bg-secondary/50"
                    }`}
                  >
                    {getServiceIcon(stop.service)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground font-mono">
                      {stop.provider}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="size-2.5" />
                      {stop.location}
                    </span>
                  </div>
                </div>
                {getStatusBadge(stop.status)}
              </div>

              {/* Service description */}
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {stop.service}
              </p>

              {/* Dates row */}
              <div className="flex items-center gap-4 mb-2">
                {stop.dateIn && (
                  <div className="flex flex-col">
                    <span className="text-[9px] tracking-wider uppercase text-muted-foreground">
                      Ingreso
                    </span>
                    <span className="text-[11px] font-medium text-foreground font-mono">
                      {stop.dateIn}
                    </span>
                  </div>
                )}
                {stop.dateOut && (
                  <div className="flex flex-col">
                    <span className="text-[9px] tracking-wider uppercase text-muted-foreground">
                      Salida
                    </span>
                    <span className="text-[11px] font-medium text-foreground font-mono">
                      {stop.dateOut}
                    </span>
                  </div>
                )}
                {stop.status === "pending" && !stop.dateIn && (
                  <span className="text-[10px] text-muted-foreground italic">
                    Fecha por confirmar
                  </span>
                )}
              </div>

              {/* Notes */}
              {stop.notes && (
                <div className="rounded-md bg-secondary/30 border border-border/50 p-2.5 mt-1">
                  <span className="text-[10px] text-muted-foreground leading-relaxed">
                    {stop.notes}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
