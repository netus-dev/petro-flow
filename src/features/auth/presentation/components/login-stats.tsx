"use client"

import { Activity, BarChart3, Droplets, Gauge } from "lucide-react"

const stats = [
  {
    icon: Droplets,
    label: "Produccion diaria",
    value: "42,850",
    unit: "bbl/d",
  },
  {
    icon: Gauge,
    label: "Presion promedio",
    value: "3,200",
    unit: "PSI",
  },
  {
    icon: Activity,
    label: "Pozos activos",
    value: "186",
    unit: "pozos",
  },
  {
    icon: BarChart3,
    label: "Eficiencia",
    value: "97.4",
    unit: "%",
  },
]

export function LoginStats() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-1 rounded-lg border border-border/50 bg-secondary/30 p-3 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            <stat.icon className="size-3.5 text-primary" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-foreground font-mono tabular-nums">
              {stat.value}
            </span>
            <span className="text-[10px] text-muted-foreground">{stat.unit}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
