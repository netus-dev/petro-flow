"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/core/presentation/components/ui/card";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  Calendar,
  ArrowUpRight,
  History,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { TimesheetStats, TimesheetRequest } from "../../domain/entities";
import { Badge } from "@/src/core/presentation/components/ui/badge";
import { Button } from "@/src/core/presentation/components/ui/button";

interface Props {
  role: "Técnico" | "Supervisor" | "Gerente";
  stats: TimesheetStats | null;
  recentRequests: TimesheetRequest[];
  onViewDetail: (request: TimesheetRequest) => void;
}

export function TimesheetDashboard({
  role,
  stats,
  recentRequests,
  onViewDetail,
}: Props) {
  if (!stats) return null;

  const isAutorizador = role === "Supervisor" || role === "Gerente";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aprobada":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Rechazada":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "Pendiente Supervisor":
      case "Pendiente Gerente":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  const kpis = isAutorizador
    ? [
        {
          label: "Recibidas",
          value: stats.totalRequests,
          icon: History,
          color: "text-foreground",
        },
        {
          label: "Pendientes",
          value: stats.pendingRequests,
          icon: AlertCircle,
          color: "text-amber-500",
        },
        {
          label: "Aprobadas",
          value: stats.approvedRequests,
          icon: CheckCircle2,
          color: "text-emerald-500",
        },
        {
          label: "Rechazadas",
          value: stats.rejectedRequests,
          icon: XCircle,
          color: "text-red-400",
        },
        {
          label: "Por Aprobar",
          value: `${stats.totalExtraHours}h`,
          icon: Clock,
          color: "text-primary",
        },
      ]
    : [
        {
          label: "Realizadas",
          value: stats.totalRequests,
          icon: History,
          color: "text-foreground",
        },
        {
          label: "En Proceso",
          value: stats.pendingRequests,
          icon: AlertCircle,
          color: "text-amber-500",
        },
        {
          label: "Aprobadas",
          value: stats.approvedRequests,
          icon: CheckCircle2,
          color: "text-emerald-500",
        },
        {
          label: "Horas Extra",
          value: `${stats.totalExtraHours}h`,
          icon: Clock,
          color: "text-primary",
        },
        {
          label: "Est. Pago",
          value: `$${stats.estimatedPayment?.toLocaleString()}`,
          icon: TrendingUp,
          color: "text-emerald-500",
        },
      ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Rows: KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-border bg-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex items-center justify-center size-10 rounded-lg bg-secondary/50">
                <kpi.icon className={`size-5 ${kpi.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-mono tracking-tight text-foreground">
                  {kpi.value}
                </span>
                <span className="text-[10px] tracking-wider uppercase text-muted-foreground whitespace-nowrap">
                  {kpi.label}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Visual Section: Charts */}
        <Card className="md:col-span-8 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold font-mono">
              {isAutorizador
                ? "Horas Extra por RIG (Últimos movimientos)"
                : "Horas Extra por Quincena"}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              {isAutorizador ? (
                <BarChart
                  data={[
                    { name: "RIG 702", value: 45 },
                    { name: "RIG 703", value: 32 },
                    { name: "Base", value: 12 },
                  ]}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2d3748"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#718096"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#718096"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#0096C7" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart
                  data={[
                    { name: "Q1 Ene", value: 8 },
                    { name: "Q2 Ene", value: 12 },
                    { name: "Q1 Feb", value: 6 },
                    { name: "Q2 Feb", value: 16 },
                  ]}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2d3748"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#718096"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#718096"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#17b983"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity / Secondary Metrics */}
        <Card className="md:col-span-4 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold font-mono">
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {stats.recentActivity.map((act) => (
              <div
                key={act.id}
                className="flex gap-3 relative before:absolute before:left-2.5 before:top-8 before:bottom-0 before:w-px before:bg-border last:before:hidden"
              >
                <div
                  className={`size-5 rounded-full z-10 flex items-center justify-center shrink-0 mt-0.5 ${
                    act.type === "submission"
                      ? "bg-primary/20 text-primary"
                      : act.type === "approval"
                        ? "bg-emerald-500/20 text-emerald-500"
                        : "bg-red-400/20 text-red-400"
                  }`}
                >
                  {act.type === "submission" ? (
                    <ArrowUpRight className="size-3" />
                  ) : act.type === "approval" ? (
                    <CheckCircle2 className="size-3" />
                  ) : (
                    <XCircle className="size-3" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {act.actor}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    {act.message}
                  </span>
                  <span className="text-[9px] text-muted-foreground/60">
                    {act.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Recent Requests Cards */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-muted-foreground px-1">
          {isAutorizador
            ? "Solicitudes Recientes para Revisión"
            : "Mis Últimas Solicitudes"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentRequests.slice(0, 6).map((req) => (
            <Card
              key={req.id}
              className="border-border bg-card hover:bg-secondary/20 transition-colors shadow-sm"
            >
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-primary font-mono">
                      {req.folio}
                    </span>
                    <span className="text-sm font-semibold text-foreground truncate w-40">
                      {isAutorizador
                        ? req.workerName
                        : `${req.periodStart} – ${req.periodEnd}`}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-2 py-0 h-5 font-semibold ${getStatusColor(req.status)}`}
                  >
                    {req.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-border/50 py-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-tighter text-muted-foreground">
                      Horas Extra
                    </span>
                    <span className="text-sm font-bold font-mono text-foreground">
                      +{req.totalExtraHours}h
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-tighter text-muted-foreground">
                      RIG
                    </span>
                    <span className="text-sm font-bold font-mono text-foreground">
                      {req.rig}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    Enviado: {req.submittedAt?.split("T")[0] || "N/A"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1 text-primary hover:bg-primary/5 hover:text-primary p-0"
                    onClick={() => onViewDetail(req)}
                  >
                    Ver detalle
                    <ArrowUpRight className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
