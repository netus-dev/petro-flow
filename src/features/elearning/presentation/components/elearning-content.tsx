"use client";

import { useState } from "react";
import {
  GraduationCap,
  ExternalLink,
  BookOpen,
  Award,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
  Link2,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/core/presentation/components/ui/card";
import { Badge } from "@/src/core/presentation/components/ui/badge";
import { Button } from "@/src/core/presentation/components/ui/button";
import { Input } from "@/src/core/presentation/components/ui/input";
import { Label } from "@/src/core/presentation/components/ui/label";
import { Progress } from "@/src/core/presentation/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/core/presentation/components/ui/tabs";

// Simulated Moodle courses synced
const courses = [
  {
    id: 1,
    name: "Seguridad en Operaciones de Perforacion",
    category: "Seguridad",
    enrolled: 45,
    completed: 38,
    progress: 84,
    lastSync: "Hace 15 min",
    moodleId: "MOODLE-SEC-101",
    status: "active" as const,
  },
  {
    id: 2,
    name: "Manejo de Equipos de Alta Presion",
    category: "Operaciones",
    enrolled: 32,
    completed: 28,
    progress: 87,
    lastSync: "Hace 15 min",
    moodleId: "MOODLE-OPS-204",
    status: "active" as const,
  },
  {
    id: 3,
    name: "Certificacion HSE Nivel II",
    category: "Certificaciones",
    enrolled: 60,
    completed: 42,
    progress: 70,
    lastSync: "Hace 15 min",
    moodleId: "MOODLE-HSE-302",
    status: "active" as const,
  },
  {
    id: 4,
    name: "Procedimientos de Emergencia en Plataformas",
    category: "Seguridad",
    enrolled: 55,
    completed: 55,
    progress: 100,
    lastSync: "Hace 15 min",
    moodleId: "MOODLE-SEC-105",
    status: "completed" as const,
  },
  {
    id: 5,
    name: "Introduccion a Orometria Digital",
    category: "Tecnico",
    enrolled: 20,
    completed: 5,
    progress: 25,
    lastSync: "Hace 15 min",
    moodleId: "MOODLE-TEC-110",
    status: "active" as const,
  },
  {
    id: 6,
    name: "Gestion Ambiental en Operaciones Petroleras",
    category: "Ambiental",
    enrolled: 40,
    completed: 0,
    progress: 0,
    lastSync: "Hace 15 min",
    moodleId: "MOODLE-AMB-201",
    status: "upcoming" as const,
  },
];

import { useElearning } from "../hooks/use-elearning";

export function ElearningContent() {
  const { courses, stats, loading } = useElearning();
  const [moodleUrl, setMoodleUrl] = useState("https://moodle.petroflow.com");
  const [moodleToken, setMoodleToken] = useState("");
  const [isConnected, setIsConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  if (loading || !stats) {
    return (
      <div className="p-6 text-center text-muted-foreground font-mono text-xs">
        Cargando plataforma e-learning...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 border border-primary/20">
            <GraduationCap className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight">
              E-Learning
            </h1>
            <p className="text-sm text-muted-foreground">
              Plataforma de capacitacion integrada con Moodle
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-border"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw
                className={`size-3 mr-1.5 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? "Sincronizando..." : "Sincronizar"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
            onClick={() => window.open(moodleUrl, "_blank")}
          >
            <ExternalLink className="size-3 mr-1.5" />
            Abrir Moodle
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Cursos Totales",
            value: stats.totalCourses,
            icon: BookOpen,
            color: "text-primary",
          },
          {
            label: "Estudiantes Activos",
            value: stats.activeStudents,
            icon: Users,
            color: "text-foreground",
          },
          {
            label: "Tasa de Completado",
            value: `${stats.completionRate}%`,
            icon: TrendingUp,
            color: "text-emerald-500",
          },
          {
            label: "Certificaciones",
            value: stats.certifications,
            icon: Award,
            color: "text-primary",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex items-center justify-center size-8 rounded-md bg-secondary/50">
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-mono tabular-nums text-foreground">
                  {stat.value}
                </span>
                <span className="text-[9px] tracking-wider uppercase text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs: Courses + Moodle Config */}
      <Tabs defaultValue="courses" className="flex flex-col gap-4">
        <TabsList className="bg-secondary/50 border border-border w-fit">
          <TabsTrigger value="courses" className="text-xs">
            <BookOpen className="size-3 mr-1.5" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="config" className="text-xs">
            <Settings className="size-3 mr-1.5" />
            Configuracion Moodle
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="flex flex-col gap-3 mt-0">
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
            Cursos Sincronizados ({courses.length})
          </span>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="border-border bg-card hover:border-primary/20 transition-colors cursor-pointer"
              >
                <CardContent className="flex flex-col gap-3 p-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant="secondary"
                      className="text-[9px] border-border tracking-wider uppercase"
                    >
                      {course.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[9px] tracking-wider uppercase ${
                        course.status === "completed"
                          ? "border-emerald-500/30 text-emerald-500"
                          : course.status === "active"
                            ? "border-primary/30 text-primary"
                            : "border-muted-foreground/30 text-muted-foreground"
                      }`}
                    >
                      {course.status === "completed"
                        ? "Completado"
                        : course.status === "active"
                          ? "Activo"
                          : "Proximo"}
                    </Badge>
                  </div>

                  {/* Course name */}
                  <h3 className="text-xs font-semibold text-foreground leading-relaxed line-clamp-2">
                    {course.name}
                  </h3>

                  {/* Progress */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        Progreso
                      </span>
                      <span className="text-[10px] font-bold font-mono text-foreground">
                        {course.progress}%
                      </span>
                    </div>
                    <Progress value={course.progress} className="h-1.5" />
                  </div>

                  {/* Footer stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Users className="size-3" />
                      {course.completed}/{course.enrolled} completados
                    </div>
                    <span className="text-[9px] text-muted-foreground font-mono">
                      {course.moodleId}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="mt-0">
          <Card className="border-border bg-card max-w-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-semibold font-mono text-foreground flex items-center gap-2">
                <Link2 className="size-4 text-primary" />
                Configuracion de Moodle
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Configura la conexion con tu instancia de Moodle para
                sincronizar cursos, progreso y certificaciones.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Connection status */}
              <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/20 p-3">
                {isConnected ? (
                  <>
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span className="text-xs text-emerald-500 font-medium">
                      Conectado a Moodle
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      Ultima sincronizacion: Hace 15 min
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="size-4 text-red-400" />
                    <span className="text-xs text-red-400 font-medium">
                      No conectado
                    </span>
                  </>
                )}
              </div>

              {/* URL */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  URL de Moodle
                </Label>
                <Input
                  value={moodleUrl}
                  onChange={(e) => setMoodleUrl(e.target.value)}
                  placeholder="https://tu-moodle.com"
                  className="h-9 text-xs bg-secondary/50 border-border"
                />
              </div>

              {/* Token */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Token de API (Webservice)
                </Label>
                <Input
                  type="password"
                  value={moodleToken}
                  onChange={(e) => setMoodleToken(e.target.value)}
                  placeholder="Ingresa tu token de Moodle Webservice"
                  className="h-9 text-xs bg-secondary/50 border-border"
                />
                <span className="text-[10px] text-muted-foreground">
                  Genera el token en Moodle: Administracion del sitio &gt;
                  Plugins &gt; Servicios web &gt; Gestionar tokens
                </span>
              </div>

              {/* Save */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Guardar Configuracion
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-border"
                >
                  Probar Conexion
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
