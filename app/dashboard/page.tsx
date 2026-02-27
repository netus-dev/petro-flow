import {
  Route,
  Clock,
  GraduationCap,
  Gauge,
  CalendarRange,
  Droplets,
  Activity,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/core/presentation/components/ui/card";
import { Badge } from "@/src/core/presentation/components/ui/badge";
import { DashboardKPICards } from "@/src/features/dashboard/presentation/components/dashboard-kpi-cards";
import { DashboardModuleCards } from "@/src/features/dashboard/presentation/components/dashboard-module-cards";
import { DashboardActivity } from "@/src/features/dashboard/presentation/components/dashboard-activity";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight">
            Dashboard Principal
          </h1>
          <Badge
            variant="outline"
            className="border-primary/30 text-primary text-[10px] tracking-wider uppercase"
          >
            En vivo
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Vista general de las operaciones. Ultimo reporte: 27 Feb 2026, 14:30
          hrs.
        </p>
      </div>

      {/* KPI Cards */}
      <DashboardKPICards />

      {/* Modules Grid */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
          Modulos del Sistema
        </h2>
        <DashboardModuleCards />
      </div>

      {/* Activity & Quick Stats */}
      <DashboardActivity />
    </div>
  );
}
