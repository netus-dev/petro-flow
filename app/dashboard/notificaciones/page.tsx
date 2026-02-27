"use client"

import { useState } from "react"
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  Wrench,
  GraduationCap,
  CalendarRange,
  FileText,
  Trash2,
  Check,
  Filter,
} from "lucide-react"
import { Card, CardContent } from "@/src/core/presentation/components/ui/card"
import { Button } from "@/src/core/presentation/components/ui/button"
import { Badge } from "@/src/core/presentation/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/core/presentation/components/ui/select"

interface Notification {
  id: number
  title: string
  description: string
  time: string
  date: string
  unread: boolean
  type: "alerta" | "reporte" | "mantenimiento" | "timesheet" | "elearning" | "orometro" | "lookahead" | "sistema"
  module: string
  priority: "alta" | "media" | "baja"
}

const allNotifications: Notification[] = [
  {
    id: 1,
    title: "Alerta de presion critica",
    description: "Pozo PF-042 supero el umbral de 3,500 PSI. Se requiere revision inmediata del equipo de seguridad.",
    time: "Hace 5 min",
    date: "27 Feb 2026",
    unread: true,
    type: "alerta",
    module: "Dashboard",
    priority: "alta",
  },
  {
    id: 2,
    title: "Reporte diario de produccion disponible",
    description: "El reporte de produccion del 26 de febrero esta listo para revision. Produccion total: 12,450 bbl/d.",
    time: "Hace 1 hora",
    date: "27 Feb 2026",
    unread: true,
    type: "reporte",
    module: "Dashboard",
    priority: "media",
  },
  {
    id: 3,
    title: "Mantenimiento programado — Plataforma Norte",
    description: "Mantenimiento preventivo programado para el 28 de febrero. Duracion estimada: 8 horas. Coordinador: Ing. Rodriguez.",
    time: "Hace 3 horas",
    date: "27 Feb 2026",
    unread: true,
    type: "mantenimiento",
    module: "Trazabilidad",
    priority: "media",
  },
  {
    id: 4,
    title: "Solicitud de horas extra aprobada",
    description: "Tu solicitud de 4 horas extra del 25 de febrero fue aprobada por Ing. Ana Torres. Motivo: Inspeccion de emergencia.",
    time: "Hace 5 horas",
    date: "27 Feb 2026",
    unread: true,
    type: "timesheet",
    module: "Timesheet",
    priority: "baja",
  },
  {
    id: 5,
    title: "Nuevo curso disponible en Moodle",
    description: "El curso 'Seguridad Industrial Avanzada - Modulo 3' ha sido publicado. Fecha limite de completacion: 15 de marzo.",
    time: "Hace 8 horas",
    date: "27 Feb 2026",
    unread: false,
    type: "elearning",
    module: "E-Learning",
    priority: "media",
  },
  {
    id: 6,
    title: "Odometro Bomba Principal B-03 — Umbral alcanzado",
    description: "La bomba B-03 de Plataforma Sur ha alcanzado 4,800 de 5,000 horas operativas. Programar mantenimiento preventivo.",
    time: "Hace 12 horas",
    date: "26 Feb 2026",
    unread: false,
    type: "orometro",
    module: "Orometers",
    priority: "alta",
  },
  {
    id: 7,
    title: "Tarea proxima a vencer en Look-a-Head",
    description: "La tarea 'Inspeccion de Valvulas de Seguridad' en Plataforma Este vence manana 28 de febrero. Progreso actual: 60%.",
    time: "Hace 1 dia",
    date: "26 Feb 2026",
    unread: false,
    type: "lookahead",
    module: "Look-a-Head",
    priority: "alta",
  },
  {
    id: 8,
    title: "Equipo BBA-2200 completado en ServTech",
    description: "El equipo BBA-2200 ha completado la etapa de mantenimiento en ServTech Solutions y esta listo para recoleccion.",
    time: "Hace 1 dia",
    date: "26 Feb 2026",
    unread: false,
    type: "mantenimiento",
    module: "Trazabilidad",
    priority: "media",
  },
  {
    id: 9,
    title: "Solicitud de horas extra pendiente de aprobacion",
    description: "Pedro Martinez solicito 6 horas extra para el 24 de febrero. Motivo: Reparacion de emergencia Pozo PF-019. Esperando tu aprobacion.",
    time: "Hace 2 dias",
    date: "25 Feb 2026",
    unread: false,
    type: "timesheet",
    module: "Timesheet",
    priority: "media",
  },
  {
    id: 10,
    title: "Actualizacion del sistema completada",
    description: "PetroFlow se ha actualizado a la version 2.4.1. Se incluyen mejoras de rendimiento en el modulo de Orometers y correccion de errores en el Gantt.",
    time: "Hace 3 dias",
    date: "24 Feb 2026",
    unread: false,
    type: "sistema",
    module: "Sistema",
    priority: "baja",
  },
  {
    id: 11,
    title: "Certificacion HSE vencida",
    description: "Tu certificacion de Seguridad, Higiene y Ambiente (HSE) vencio el 22 de febrero. Completa el curso de recertificacion en E-Learning.",
    time: "Hace 5 dias",
    date: "22 Feb 2026",
    unread: false,
    type: "elearning",
    module: "E-Learning",
    priority: "alta",
  },
  {
    id: 12,
    title: "Nueva plataforma agregada al Look-a-Head",
    description: "La Plataforma Oeste ha sido configurada en el modulo Look-a-Head. Ya puedes crear tareas y asignar actividades.",
    time: "Hace 1 semana",
    date: "20 Feb 2026",
    unread: false,
    type: "lookahead",
    module: "Look-a-Head",
    priority: "baja",
  },
]

const typeIcons: Record<string, typeof Bell> = {
  alerta: AlertTriangle,
  reporte: FileText,
  mantenimiento: Wrench,
  timesheet: Clock,
  elearning: GraduationCap,
  orometro: Gauge,
  lookahead: CalendarRange,
  sistema: CheckCircle2,
}

const typeColors: Record<string, string> = {
  alerta: "text-destructive bg-destructive/10",
  reporte: "text-primary bg-primary/10",
  mantenimiento: "text-chart-4 bg-chart-4/10",
  timesheet: "text-chart-2 bg-chart-2/10",
  elearning: "text-chart-5 bg-chart-5/10",
  orometro: "text-chart-1 bg-chart-1/10",
  lookahead: "text-chart-3 bg-chart-3/10",
  sistema: "text-emerald-400 bg-emerald-500/10",
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  alta: { label: "Alta", className: "bg-destructive/10 text-destructive border-destructive/20" },
  media: { label: "Media", className: "bg-primary/10 text-primary border-primary/20" },
  baja: { label: "Baja", className: "bg-muted text-muted-foreground border-border" },
}

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState(allNotifications)
  const [filterModule, setFilterModule] = useState("todos")
  const [filterPriority, setFilterPriority] = useState("todas")

  const filteredNotifications = notifications.filter((n) => {
    if (filterModule !== "todos" && n.module !== filterModule) return false
    if (filterPriority !== "todas" && n.priority !== filterPriority) return false
    return true
  })

  const unreadCount = notifications.filter((n) => n.unread).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    )
  }

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const groupByDate = (items: Notification[]) => {
    const groups: Record<string, Notification[]> = {}
    for (const item of items) {
      if (!groups[item.date]) groups[item.date] = []
      groups[item.date].push(item)
    }
    return groups
  }

  const grouped = groupByDate(filteredNotifications)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 border border-primary/20">
            <Bell className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground font-mono tracking-tight">
              Notificaciones
            </h1>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0
                ? `Tienes ${unreadCount} notificacion${unreadCount > 1 ? "es" : ""} sin leer`
                : "Todas las notificaciones estan leidas"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              className="text-[10px] h-8 gap-1.5 border-border text-foreground hover:bg-secondary"
            >
              <Check className="size-3.5" />
              Marcar todas como leidas
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            Filtros
          </span>
        </div>
        <Select value={filterModule} onValueChange={setFilterModule}>
          <SelectTrigger className="w-44 h-8 bg-secondary/50 border-border text-foreground text-xs">
            <SelectValue placeholder="Modulo" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="todos" className="text-foreground text-xs">Todos los Modulos</SelectItem>
            <SelectItem value="Dashboard" className="text-foreground text-xs">Dashboard</SelectItem>
            <SelectItem value="Trazabilidad" className="text-foreground text-xs">Trazabilidad</SelectItem>
            <SelectItem value="Timesheet" className="text-foreground text-xs">Timesheet</SelectItem>
            <SelectItem value="E-Learning" className="text-foreground text-xs">E-Learning</SelectItem>
            <SelectItem value="Orometers" className="text-foreground text-xs">Orometers</SelectItem>
            <SelectItem value="Look-a-Head" className="text-foreground text-xs">Look-a-Head</SelectItem>
            <SelectItem value="Sistema" className="text-foreground text-xs">Sistema</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-36 h-8 bg-secondary/50 border-border text-foreground text-xs">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="todas" className="text-foreground text-xs">Todas</SelectItem>
            <SelectItem value="alta" className="text-foreground text-xs">Alta</SelectItem>
            <SelectItem value="media" className="text-foreground text-xs">Media</SelectItem>
            <SelectItem value="baja" className="text-foreground text-xs">Baja</SelectItem>
          </SelectContent>
        </Select>
        {(filterModule !== "todos" || filterPriority !== "todas") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterModule("todos")
              setFilterPriority("todas")
            }}
            className="text-[10px] h-8 text-muted-foreground hover:text-foreground"
          >
            Limpiar filtros
          </Button>
        )}
        <div className="ml-auto">
          <Badge variant="secondary" className="text-[10px] bg-secondary/50 text-muted-foreground">
            {filteredNotifications.length} resultado{filteredNotifications.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Notification list grouped by date */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <Bell className="size-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No hay notificaciones</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            Ajusta los filtros o vuelve mas tarde
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {date}
                </span>
                <div className="flex-1 h-px bg-border" />
                <Badge variant="secondary" className="text-[9px] bg-secondary/50 text-muted-foreground">
                  {items.length}
                </Badge>
              </div>

              <div className="space-y-1.5">
                {items.map((notification) => {
                  const Icon = typeIcons[notification.type] || Bell
                  const iconColor = typeColors[notification.type] || "text-muted-foreground bg-secondary/50"
                  const priority = priorityConfig[notification.priority]

                  return (
                    <Card
                      key={notification.id}
                      className={`bg-card border-border transition-all group hover:border-primary/20 ${
                        notification.unread ? "border-l-2 border-l-primary" : ""
                      }`}
                    >
                      <CardContent className="flex items-start gap-4 p-4">
                        <div
                          className={`flex items-center justify-center size-9 rounded-lg shrink-0 ${iconColor}`}
                        >
                          <Icon className="size-4" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {notification.unread && (
                              <span className="size-1.5 rounded-full bg-primary shrink-0" />
                            )}
                            <span
                              className={`text-xs font-medium ${
                                notification.unread ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {notification.title}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`text-[8px] ${priority.className}`}
                            >
                              {priority.label}
                            </Badge>
                            <Badge variant="secondary" className="text-[8px] bg-secondary/50 text-muted-foreground">
                              {notification.module}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {notification.description}
                          </p>
                          <span className="text-[10px] text-muted-foreground/60">
                            {notification.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {notification.unread && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(notification.id)}
                              className="size-7 text-muted-foreground hover:text-primary"
                              aria-label="Marcar como leida"
                            >
                              <Check className="size-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                            className="size-7 text-muted-foreground hover:text-destructive"
                            aria-label="Eliminar notificacion"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
