"use client"

import { useState } from "react"
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Save,
  Camera,
  Mail,
  Phone,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/core/presentation/components/ui/card"
import { Input } from "@/src/core/presentation/components/ui/input"
import { Label } from "@/src/core/presentation/components/ui/label"
import { Button } from "@/src/core/presentation/components/ui/button"
import { Switch } from "@/src/core/presentation/components/ui/switch"
import { Badge } from "@/src/core/presentation/components/ui/badge"
import { Avatar, AvatarFallback } from "@/src/core/presentation/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/core/presentation/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/core/presentation/components/ui/tabs"

const settingsSections = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "notificaciones", label: "Notificaciones", icon: Bell },
  { id: "seguridad", label: "Seguridad", icon: Shield },
  { id: "apariencia", label: "Apariencia", icon: Palette },
  { id: "sistema", label: "Sistema", icon: Database },
]

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 border border-primary/20">
            <Settings className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground font-mono tracking-tight">
              Configuracion
            </h1>
            <p className="text-xs text-muted-foreground">
              Administra tu cuenta y preferencias del sistema
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Save className="size-4" />
          {saved ? "Guardado" : "Guardar Cambios"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="bg-secondary/50 border border-border p-1 h-auto flex-wrap">
          {settingsSections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="gap-2 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <section.icon className="size-3.5" />
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Perfil */}
        <TabsContent value="perfil" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Informacion Personal
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Actualiza tu foto de perfil y datos personales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="size-20 rounded-xl border-2 border-border">
                    <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xl font-bold">
                      CM
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="size-5 text-foreground" />
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Carlos Mendez</p>
                  <p className="text-xs text-muted-foreground">Ingeniero de Produccion</p>
                  <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                    Administrador
                  </Badge>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-2">
                    <User className="size-3" /> Nombre Completo
                  </Label>
                  <Input
                    defaultValue="Carlos Mendez"
                    className="bg-secondary/50 border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-2">
                    <Mail className="size-3" /> Correo Electronico
                  </Label>
                  <Input
                    defaultValue="carlos.mendez@petroflow.com"
                    className="bg-secondary/50 border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-2">
                    <Phone className="size-3" /> Telefono
                  </Label>
                  <Input
                    defaultValue="+58 412-555-0123"
                    className="bg-secondary/50 border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-2">
                    <Building2 className="size-3" /> Departamento
                  </Label>
                  <Select defaultValue="produccion">
                    <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="produccion" className="text-foreground">Produccion</SelectItem>
                      <SelectItem value="operaciones" className="text-foreground">Operaciones</SelectItem>
                      <SelectItem value="mantenimiento" className="text-foreground">Mantenimiento</SelectItem>
                      <SelectItem value="seguridad" className="text-foreground">Seguridad Industrial</SelectItem>
                      <SelectItem value="logistica" className="text-foreground">Logistica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-2">
                    <Globe className="size-3" /> Plataforma Asignada
                  </Label>
                  <Select defaultValue="norte">
                    <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="norte" className="text-foreground">Plataforma Norte</SelectItem>
                      <SelectItem value="sur" className="text-foreground">Plataforma Sur</SelectItem>
                      <SelectItem value="este" className="text-foreground">Plataforma Este</SelectItem>
                      <SelectItem value="oeste" className="text-foreground">Plataforma Oeste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-2">
                    <KeyRound className="size-3" /> ID de Empleado
                  </Label>
                  <Input
                    defaultValue="PF-EMP-00421"
                    disabled
                    className="bg-secondary/30 border-border text-muted-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificaciones */}
        <TabsContent value="notificaciones" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Preferencias de Notificaciones
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Configura como y cuando recibir alertas del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                {
                  title: "Alertas de Presion Critica",
                  desc: "Notificacion inmediata cuando un pozo supera los umbrales de presion",
                  defaultChecked: true,
                },
                {
                  title: "Reportes de Produccion",
                  desc: "Resumen diario de produccion al final de cada turno",
                  defaultChecked: true,
                },
                {
                  title: "Mantenimiento Programado",
                  desc: "Recordatorios de mantenimiento preventivo y correctivo",
                  defaultChecked: true,
                },
                {
                  title: "Aprobaciones de Horas Extra",
                  desc: "Solicitudes pendientes de aprobacion de timesheet",
                  defaultChecked: false,
                },
                {
                  title: "Actualizaciones de E-Learning",
                  desc: "Nuevos cursos disponibles y fechas limite de capacitacion",
                  defaultChecked: false,
                },
                {
                  title: "Alertas de Odometros",
                  desc: "Cuando un odometro alcanza el umbral de mantenimiento",
                  defaultChecked: true,
                },
                {
                  title: "Look-a-Head Vencimientos",
                  desc: "Tareas proximas a su fecha limite en el Gantt",
                  defaultChecked: true,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.defaultChecked} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Canales de Notificacion
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Selecciona por donde deseas recibir las alertas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "Notificaciones en la App", defaultChecked: true },
                { title: "Correo Electronico", defaultChecked: true },
                { title: "SMS", defaultChecked: false },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <p className="text-xs font-medium text-foreground">{item.title}</p>
                  <Switch defaultChecked={item.defaultChecked} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seguridad */}
        <TabsContent value="seguridad" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Cambiar Contrasena
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Actualiza tu contrasena de acceso al sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Contrasena Actual</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    className="bg-secondary/50 border-border text-foreground pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Nueva Contrasena</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    className="bg-secondary/50 border-border text-foreground pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Confirmar Nueva Contrasena</Label>
                <Input
                  type="password"
                  className="bg-secondary/50 border-border text-foreground"
                />
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs mt-2">
                Actualizar Contrasena
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Autenticacion de Dos Factores
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Agrega una capa adicional de seguridad a tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-foreground">Verificacion por SMS</p>
                  <p className="text-[11px] text-muted-foreground">Recibe un codigo de verificacion por SMS al iniciar sesion</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-foreground">App de Autenticacion</p>
                  <p className="text-[11px] text-muted-foreground">Usa Google Authenticator o similar</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Sesiones Activas
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Dispositivos donde tu cuenta esta activa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { device: "Chrome - Windows 11", location: "Maracaibo, VE", current: true, time: "Activa ahora" },
                { device: "Safari - iPhone 15", location: "Maracaibo, VE", current: false, time: "Hace 2 horas" },
                { device: "Firefox - MacOS", location: "Caracas, VE", current: false, time: "Hace 1 dia" },
              ].map((session, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-2 rounded-full ${session.current ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                    <div>
                      <p className="text-xs font-medium text-foreground">{session.device}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {session.location} &middot; {session.time}
                      </p>
                    </div>
                  </div>
                  {session.current ? (
                    <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      Sesion Actual
                    </Badge>
                  ) : (
                    <Button variant="ghost" size="sm" className="text-[10px] text-destructive hover:text-destructive h-7">
                      Cerrar
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apariencia */}
        <TabsContent value="apariencia" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Tema Visual
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Personaliza la apariencia del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "Oscuro", colors: "bg-[#1a1a2e]", active: true },
                  { name: "Claro", colors: "bg-[#f0f0f5]", active: false },
                  { name: "Alto Contraste", colors: "bg-[#000000]", active: false },
                ].map((theme) => (
                  <button
                    key={theme.name}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      theme.active
                        ? "border-primary bg-primary/5"
                        : "border-border bg-secondary/30 hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className={`size-8 rounded-md mx-auto mb-2 ${theme.colors} border border-border`} />
                    <p className={`text-[11px] font-medium ${theme.active ? "text-primary" : "text-muted-foreground"}`}>
                      {theme.name}
                    </p>
                    {theme.active && (
                      <Badge className="text-[8px] mt-1.5 bg-primary/10 text-primary border-primary/20">
                        Activo
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Preferencias de Interfaz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-medium text-foreground">Sidebar Compacto</p>
                  <p className="text-[11px] text-muted-foreground">Reducir el sidebar a solo iconos por defecto</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-border">
                <div>
                  <p className="text-xs font-medium text-foreground">Animaciones</p>
                  <p className="text-[11px] text-muted-foreground">Activar transiciones y animaciones en la interfaz</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-border">
                <div>
                  <p className="text-xs font-medium text-foreground">Vista Compacta en Tablas</p>
                  <p className="text-[11px] text-muted-foreground">Reducir el espaciado en tablas de datos</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Idioma y Region
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Idioma</Label>
                <Select defaultValue="es">
                  <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="es" className="text-foreground">Espanol</SelectItem>
                    <SelectItem value="en" className="text-foreground">English</SelectItem>
                    <SelectItem value="pt" className="text-foreground">Portugues</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Zona Horaria</Label>
                <Select defaultValue="vet">
                  <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="vet" className="text-foreground">VET (UTC -4:00)</SelectItem>
                    <SelectItem value="est" className="text-foreground">EST (UTC -5:00)</SelectItem>
                    <SelectItem value="cst" className="text-foreground">CST (UTC -6:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sistema */}
        <TabsContent value="sistema" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Informacion del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Version", value: "v2.4.1" },
                { label: "Ultimo Despliegue", value: "27 Feb 2026 - 08:30 AM" },
                { label: "Base de Datos", value: "PostgreSQL 16.2" },
                { label: "Servidor", value: "Produccion — us-east-1" },
                { label: "Uptime", value: "99.98% (ultimos 30 dias)" },
              ].map((info, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-xs text-muted-foreground">{info.label}</span>
                  <span className="text-xs font-medium text-foreground font-mono">{info.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Integraciones
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Servicios conectados al sistema PetroFlow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Moodle LMS", status: "Conectado", active: true },
                { name: "API de Produccion SCADA", status: "Conectado", active: true },
                { name: "Sistema de Nomina (SAP)", status: "Conectado", active: true },
                { name: "Servicio de SMS", status: "Desconectado", active: false },
              ].map((integration, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-2 rounded-full ${integration.active ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                    <span className="text-xs font-medium text-foreground">{integration.name}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-[9px] ${
                      integration.active
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {integration.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-destructive/30">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-destructive">
                Zona de Peligro
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Acciones irreversibles — procede con precaucion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Limpiar Cache del Sistema</p>
                  <p className="text-[11px] text-muted-foreground">Elimina datos temporales almacenados en cache</p>
                </div>
                <Button variant="outline" size="sm" className="text-[10px] h-7 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  Limpiar
                </Button>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <p className="text-xs font-medium text-foreground">Exportar Todos los Datos</p>
                  <p className="text-[11px] text-muted-foreground">Descargar un backup completo de tu informacion</p>
                </div>
                <Button variant="outline" size="sm" className="text-[10px] h-7 border-border text-foreground hover:bg-secondary">
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
