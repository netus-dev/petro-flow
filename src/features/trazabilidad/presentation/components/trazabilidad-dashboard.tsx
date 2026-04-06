"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/core/presentation/components/ui/card";
import {
  Package,
  Truck,
  HardHat,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrazabilidadStats } from "../../domain/entities";
import { useTrazabilidadDashboard } from "../hooks/use-trazabilidad-dashboard";
import { 
  FunctionalPrincipleSelector, 
  AssetLocationChart 
} from "./dashboard/trazabilidad-chart-components";

const COLORS = ["#0096C7", "#17b983", "#f59e0b", "#6366f1"];

interface Props {
  stats: TrazabilidadStats | null;
}

/**
 * Section for detailed asset statistics by functional principle.
 */
function AssetStatsDashboardSection({ className }: { className?: string }) {
  const { 
    principles, 
    selectedPrincipleId, 
    stats, 
    isLoading, 
    handlePrincipleChange 
  } = useTrazabilidadDashboard();

  return (
    <div className={className}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold font-mono uppercase tracking-wider text-muted-foreground">
            Análisis por Principio Funcional
          </h3>
          <FunctionalPrincipleSelector 
            principles={principles}
            selectedId={selectedPrincipleId}
            onChange={handlePrincipleChange}
            disabled={isLoading}
          />
        </div>
        
        <AssetLocationChart 
          data={stats}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export function TrazabilidadDashboard({ stats }: Props) {
  if (!stats) return null;

  const kpis = [
    {
      label: "Total Activos",
      value: stats.totalAssets,
      icon: Package,
      color: "text-foreground",
    },
    {
      label: "En RIG 702",
      value: stats.assetsInRig702,
      icon: HardHat,
      color: "text-[#0096C7]",
    },
    {
      label: "En RIG 703",
      value: stats.assetsInRig703,
      icon: HardHat,
      color: "text-[#17b983]",
    },
    {
      label: "En Tránsito",
      value: stats.assetsInTransit,
      icon: Truck,
      color: "text-amber-500",
    },
    {
      label: "En Proveedor",
      value: stats.assetsInProviderBase,
      icon: Package,
      color: "text-indigo-500",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-border bg-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex items-center justify-center size-10 rounded-lg bg-secondary/50">
                <kpi.icon className={`size-5 ${kpi.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
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
        {/* Distribution Map (Donut) */}
        <Card className="md:col-span-5 lg:col-span-4 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold font-mono">
              Distribución por Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.distributionByLocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.distributionByLocation.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {stats.distributionByLocation.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-[10px] text-muted-foreground uppercase">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Asset Stats Section */}
        <AssetStatsDashboardSection className="md:col-span-12 lg:col-span-8" />
      </div>

      {/* Alerts */}
      {/* <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-semibold font-mono flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-500" />
            Alertas de Gestión
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.alerts.map((alert, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                  {alert.type === "high-movement"
                    ? "Alta Rotación"
                    : "Asignación Pendiente"}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {alert.assetCode}
                </span>
                <span className="text-xs text-muted-foreground">
                  {alert.message}
                </span>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-primary hover:underline group">
                Investigar
                <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card> */}
    </div>
  );
}
