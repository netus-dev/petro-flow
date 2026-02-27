import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  TrendingUp,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/core/presentation/components/ui/card"
import { Badge } from "@/src/core/presentation/components/ui/badge"

const recentActivity = [
  {
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    title: "Reporte de produccion generado",
    description: "Campo Norte — 42,850 bbl/d registrados",
    time: "Hace 12 min",
  },
  {
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    title: "Alerta de presion detectada",
    description: "Pozo PF-042 — Presion sobre umbral (3,520 PSI)",
    time: "Hace 28 min",
  },
  {
    icon: Wrench,
    iconColor: "text-blue-400",
    title: "Mantenimiento completado",
    description: "Bomba centrifuga BC-17 — Reemplazo de sellos",
    time: "Hace 1 hora",
  },
  {
    icon: TrendingUp,
    iconColor: "text-primary",
    title: "Proyeccion actualizada",
    description: "Look-a-Head Q1 2026 — Estimacion +4.1% produccion",
    time: "Hace 2 horas",
  },
  {
    icon: Clock,
    iconColor: "text-muted-foreground",
    title: "Timesheet aprobado",
    description: "Equipo Perforacion Delta — Semana 8",
    time: "Hace 3 horas",
  },
]

const quickStats = [
  { label: "Pozos en mantenimiento", value: "18", status: "warning" },
  { label: "Ordenes de trabajo abiertas", value: "47", status: "neutral" },
  { label: "Personal en campo", value: "324", status: "success" },
  { label: "Cursos pendientes", value: "12", status: "neutral" },
  { label: "Alertas activas", value: "3", status: "warning" },
  { label: "Uptime del sistema", value: "99.97%", status: "success" },
]

export function DashboardActivity() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      {/* Recent Activity */}
      <Card className="lg:col-span-3 border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold font-mono text-foreground">
            Actividad Reciente
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Ultimos eventos registrados en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-0">
          {recentActivity.map((item, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 py-3 ${
                index < recentActivity.length - 1
                  ? "border-b border-border/50"
                  : ""
              }`}
            >
              <div className="flex items-center justify-center size-8 rounded-md bg-secondary/50 shrink-0 mt-0.5">
                <item.icon className={`size-4 ${item.iconColor}`} />
              </div>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-xs font-medium text-foreground">
                  {item.title}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {item.description}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {item.time}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="lg:col-span-2 border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold font-mono text-foreground">
            Resumen Rapido
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Metricas clave del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-0">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className={`flex items-center justify-between py-3 ${
                index < quickStats.length - 1
                  ? "border-b border-border/50"
                  : ""
              }`}
            >
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <span
                className={`text-sm font-bold font-mono tabular-nums ${
                  stat.status === "success"
                    ? "text-emerald-500"
                    : stat.status === "warning"
                      ? "text-amber-500"
                      : "text-foreground"
                }`}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
