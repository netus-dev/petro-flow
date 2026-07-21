"use client"

import { useState } from "react"
import {
  HelpCircle,
  MessageSquare,
  BookOpen,
  FileText,
  Headphones,
  Send,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/core/presentation/components/ui/card"
import { Input } from "@/src/core/presentation/components/ui/input"
import { Label } from "@/src/core/presentation/components/ui/label"
import { Button } from "@/src/core/presentation/components/ui/button"
import { Badge } from "@/src/core/presentation/components/ui/badge"
import { Textarea } from "@/src/core/presentation/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/core/presentation/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/core/presentation/components/ui/tabs"

const faqItems = [
  {
    question: "Como registro horas extras en el Timesheet?",
    answer:
      "Ingresa al modulo Timesheet, haz clic en 'Registrar Horas Extra', completa el formulario con la fecha, cantidad de horas, motivo y plataforma asignada. Luego envia la solicitud para aprobacion de tu supervisor.",
  },
  {
    question: "Como conecto mi cuenta de Moodle al E-Learning?",
    answer:
      "Ve a E-Learning > Configuracion de Moodle. Ingresa la URL de tu instancia Moodle y el token de API proporcionado por tu administrador. Haz clic en 'Probar Conexion' para verificar.",
  },
  {
    question: "Que significan los colores en el mapa de trazabilidad?",
    answer:
      "Verde indica que la parada fue completada exitosamente, amarillo/ambar que el equipo esta actualmente en esa ubicacion, y gris que la parada esta pendiente.",
  },
  {
    question: "Como agrego una nueva tarea al diagrama Gantt?",
    answer:
      "En el modulo Look-a-Head, haz clic en 'Nueva Tarea', selecciona la plataforma, asigna nombre, fechas de inicio y fin, y el estado inicial. La tarea aparecera automaticamente en el Gantt.",
  },
  {
    question: "Cuando se actualizan los KPI de odometros?",
    answer:
      "Los KPIs se actualizan en tiempo real cada vez que se registra una nueva lectura. Puedes registrar lecturas manualmente desde el boton 'Registrar Lectura' en el modulo Orometers.",
  },
  {
    question: "Como exporto un reporte de produccion?",
    answer:
      "Desde el Dashboard principal, haz clic en el icono de exportacion en la tarjeta de KPI correspondiente. Puedes elegir entre formatos PDF, Excel y CSV.",
  },
]

const previousTickets = [
  {
    id: "TK-0042",
    subject: "Error al cargar odometros de Plataforma Este",
    status: "resuelto",
    date: "20 Feb 2026",
    priority: "alta",
  },
  {
    id: "TK-0039",
    subject: "Solicitud de acceso al modulo E-Learning",
    status: "resuelto",
    date: "15 Feb 2026",
    priority: "media",
  },
  {
    id: "TK-0045",
    subject: "Timesheet no muestra registros de enero",
    status: "en_proceso",
    date: "25 Feb 2026",
    priority: "alta",
  },
  {
    id: "TK-0046",
    subject: "Solicitud de nuevo rol para supervisor",
    status: "pendiente",
    date: "26 Feb 2026",
    priority: "baja",
  },
]

const statusConfig: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  resuelto: { label: "Resuelto", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  en_proceso: { label: "En Proceso", className: "bg-primary/10 text-primary border-primary/20", icon: Clock },
  pendiente: { label: "Pendiente", className: "bg-muted text-muted-foreground border-border", icon: AlertCircle },
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  alta: { label: "Alta", className: "bg-destructive/10 text-destructive border-destructive/20" },
  media: { label: "Media", className: "bg-primary/10 text-primary border-primary/20" },
  baja: { label: "Baja", className: "bg-muted text-muted-foreground border-border" },
}

export default function SoportePage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)
  const [submitted, setSubmitted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFaq = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 border border-primary/20">
          <HelpCircle className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground font-mono tracking-tight">
            Centro de Soporte
          </h1>
          <p className="text-xs text-muted-foreground">
            Encuentra respuestas, reporta incidencias y contacta al equipo de soporte
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: BookOpen, title: "Base de Conocimiento", desc: "Guias y tutoriales", href: "#faq" },
          { icon: MessageSquare, title: "Nuevo Ticket", desc: "Reportar una incidencia", href: "#ticket" },
          { icon: Headphones, title: "Soporte en Vivo", desc: "Chat con un agente", href: "#" },
        ].map((action, i) => (
          <Card
            key={i}
            className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer group"
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex items-center justify-center size-10 rounded-lg bg-secondary/50 group-hover:bg-primary/10 transition-colors">
                <action.icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{action.title}</p>
                <p className="text-[11px] text-muted-foreground">{action.desc}</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="bg-secondary/50 border border-border p-1">
          <TabsTrigger
            value="faq"
            className="gap-2 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <BookOpen className="size-3.5" />
            Preguntas Frecuentes
          </TabsTrigger>
          <TabsTrigger
            value="ticket"
            className="gap-2 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <MessageSquare className="size-3.5" />
            Crear Ticket
          </TabsTrigger>
          <TabsTrigger
            value="historial"
            className="gap-2 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <FileText className="size-3.5" />
            Mis Tickets
          </TabsTrigger>
        </TabsList>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en preguntas frecuentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary/50 border-border text-foreground text-sm placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            {filteredFaq.map((item, i) => (
              <Card key={i} className="bg-card border-border overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="flex items-center justify-between w-full p-4 text-left hover:bg-secondary/20 transition-colors"
                >
                  <span className="text-xs font-medium text-foreground pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`size-4 text-muted-foreground shrink-0 transition-transform ${
                      expandedFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-4 border-t border-border">
                    <p className="text-[11px] text-muted-foreground leading-relaxed pt-3">
                      {item.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
            {filteredFaq.length === 0 && (
              <div className="text-center py-8">
                <Search className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  No se encontraron resultados para tu busqueda
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Crear Ticket */}
        <TabsContent value="ticket">
          <Card className="bg-card border-border max-w-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Crear Nuevo Ticket de Soporte
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Describe tu problema y nuestro equipo te respondera lo antes posible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Categoria</Label>
                    <Select defaultValue="tecnico">
                      <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="tecnico" className="text-foreground">Problema Tecnico</SelectItem>
                        <SelectItem value="acceso" className="text-foreground">Acceso / Permisos</SelectItem>
                        <SelectItem value="datos" className="text-foreground">Error en Datos</SelectItem>
                        <SelectItem value="funcionalidad" className="text-foreground">Solicitud de Funcionalidad</SelectItem>
                        <SelectItem value="otro" className="text-foreground">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Prioridad</Label>
                    <Select defaultValue="media">
                      <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="baja" className="text-foreground">Baja</SelectItem>
                        <SelectItem value="media" className="text-foreground">Media</SelectItem>
                        <SelectItem value="alta" className="text-foreground">Alta</SelectItem>
                        <SelectItem value="critica" className="text-foreground">Critica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Modulo Afectado</Label>
                  <Select>
                    <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                      <SelectValue placeholder="Selecciona un modulo" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="trazabilidad" className="text-foreground">Trazabilidad</SelectItem>
                      <SelectItem value="timesheet" className="text-foreground">Timesheet</SelectItem>
                      <SelectItem value="elearning" className="text-foreground">E-Learning</SelectItem>
                      <SelectItem value="orometers" className="text-foreground">Orometers Dashboard</SelectItem>
                      <SelectItem value="lookahead" className="text-foreground">Look-a-Head</SelectItem>
                      <SelectItem value="dashboard" className="text-foreground">Dashboard Principal</SelectItem>
                      <SelectItem value="otro" className="text-foreground">Otro / General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Asunto</Label>
                  <Input
                    placeholder="Describe brevemente el problema"
                    className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Descripcion Detallada</Label>
                  <Textarea
                    placeholder="Incluye pasos para reproducir el problema, mensajes de error, capturas de pantalla, etc."
                    className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground min-h-32"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={submitted}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  >
                    {submitted ? (
                      <>
                        <CheckCircle2 className="size-4" />
                        Ticket Enviado
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        Enviar Ticket
                      </>
                    )}
                  </Button>
                  {submitted && (
                    <span className="text-[11px] text-emerald-400">
                      Tu ticket fue creado exitosamente. ID: TK-0047
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historial */}
        <TabsContent value="historial" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Mostrando {previousTickets.length} tickets
            </p>
            <Select defaultValue="todos">
              <SelectTrigger className="w-40 h-8 bg-secondary/50 border-border text-foreground text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="todos" className="text-foreground text-xs">Todos</SelectItem>
                <SelectItem value="pendiente" className="text-foreground text-xs">Pendientes</SelectItem>
                <SelectItem value="en_proceso" className="text-foreground text-xs">En Proceso</SelectItem>
                <SelectItem value="resuelto" className="text-foreground text-xs">Resueltos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {previousTickets.map((ticket) => {
              const status = statusConfig[ticket.status]
              const priority = priorityConfig[ticket.priority]
              const StatusIcon = status.icon
              return (
                <Card
                  key={ticket.id}
                  className="bg-card border-border hover:border-primary/20 transition-colors cursor-pointer"
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex items-center justify-center size-9 rounded-lg bg-secondary/50 shrink-0">
                      <StatusIcon className={`size-4 ${
                        ticket.status === "resuelto"
                          ? "text-emerald-400"
                          : ticket.status === "en_proceso"
                            ? "text-primary"
                            : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono text-muted-foreground">{ticket.id}</span>
                        <Badge variant="secondary" className={`text-[9px] ${priority.className}`}>
                          {priority.label}
                        </Badge>
                      </div>
                      <p className="text-xs font-medium text-foreground truncate">
                        {ticket.subject}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{ticket.date}</p>
                    </div>
                    <Badge variant="secondary" className={`text-[9px] shrink-0 ${status.className}`}>
                      {status.label}
                    </Badge>
                    <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
