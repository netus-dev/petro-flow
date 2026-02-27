import {
  Droplets,
  Gauge,
  Activity,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent } from "@/src/core/presentation/components/ui/card"

const kpis = [
  {
    icon: Droplets,
    label: "Produccion Diaria",
    value: "42,850",
    unit: "bbl/d",
    change: "+3.2%",
    trend: "up" as const,
    description: "vs. dia anterior",
  },
  {
    icon: Gauge,
    label: "Presion Promedio",
    value: "3,200",
    unit: "PSI",
    change: "-0.8%",
    trend: "down" as const,
    description: "vs. dia anterior",
  },
  {
    icon: Activity,
    label: "Pozos Activos",
    value: "186",
    unit: "de 204",
    change: "+2",
    trend: "up" as const,
    description: "reactivados hoy",
  },
  {
    icon: BarChart3,
    label: "Eficiencia General",
    value: "97.4",
    unit: "%",
    change: "+0.6%",
    trend: "up" as const,
    description: "vs. semana pasada",
  },
]

export function DashboardKPICards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.label}
          className="border-border bg-card hover:border-primary/20 transition-colors duration-200"
        >
          <CardContent className="flex flex-col gap-3 p-4">
            {/* Top row: icon + label */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-md bg-primary/10">
                <kpi.icon className="size-4 text-primary" />
              </div>
              <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground">
                {kpi.label}
              </span>
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-foreground font-mono tabular-nums">
                {kpi.value}
              </span>
              <span className="text-xs text-muted-foreground">{kpi.unit}</span>
            </div>

            {/* Change */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-0.5 text-[11px] font-medium ${
                  kpi.trend === "up"
                    ? "text-emerald-500"
                    : "text-red-400"
                }`}
              >
                {kpi.trend === "up" ? (
                  <ArrowUpRight className="size-3" />
                ) : (
                  <ArrowDownRight className="size-3" />
                )}
                {kpi.change}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {kpi.description}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
