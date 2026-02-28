"use client";

import Link from "next/link";
import {
  Route,
  Clock,
  GraduationCap,
  Gauge,
  CalendarRange,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/src/core/presentation/components/ui/card";
import { Badge } from "@/src/core/presentation/components/ui/badge";

const modules = [
  {
    title: "Trazabilidad",
    description:
      "Seguimiento integral de materiales, equipos y procesos a lo largo de toda la cadena operativa.",
    icon: Route,
    href: "/dashboard/trazabilidad",
    badge: "12 activos",
    badgeVariant: "default" as const,
    stat: "98.7% cobertura",
  },
  {
    title: "Timesheet",
    description:
      "Registro y control de horas laborales del personal en campo y oficinas centrales.",
    icon: Clock,
    href: "/dashboard/timesheet",
    badge: "342 registros",
    badgeVariant: "secondary" as const,
    stat: "Semana 9, 2026",
  },
  {
    title: "E-Learning",
    description:
      "Plataforma de capacitacion y certificacion continua para personal operativo y tecnico.",
    icon: GraduationCap,
    href: "/dashboard/e-learning",
    badge: "5 cursos nuevos",
    badgeVariant: "default" as const,
    stat: "87% completado",
  },
  {
    title: "Horometros",
    description:
      "Monitoreo en tiempo real de instrumentacion y horometros de maquinaria y equipos.",
    icon: Gauge,
    href: "/dashboard/hour-meters",
    badge: "En vivo",
    badgeVariant: "default" as const,
    stat: "204 sensores",
  },
  {
    title: "Look-a-Head Dashboard",
    description:
      "Planificacion y proyeccion de operaciones futuras con analisis de tendencias y cronogramas.",
    icon: CalendarRange,
    href: "/dashboard/look-a-head",
    badge: "Q1 2026",
    badgeVariant: "secondary" as const,
    stat: "14 proyectos",
  },
];

export function DashboardModuleCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((mod) => (
        <Link key={mod.title} href={mod.href} className="group">
          <Card className="h-full border-border bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-300 cursor-pointer">
            <CardContent className="flex flex-col gap-4 p-5">
              {/* Icon + Badge row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                  <mod.icon className="size-5 text-primary" />
                </div>
                <Badge
                  variant={mod.badgeVariant}
                  className={`text-[9px] tracking-wider uppercase ${
                    mod.badgeVariant === "default" ? "" : "border-border"
                  }`}
                >
                  {mod.badge}
                </Badge>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-semibold text-foreground font-mono group-hover:text-primary transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {mod.description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-[10px] font-medium text-muted-foreground tracking-wide">
                  {mod.stat}
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
