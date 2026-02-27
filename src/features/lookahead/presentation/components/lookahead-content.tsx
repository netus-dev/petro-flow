"use client";

import { useState } from "react";
import {
  CalendarRange,
  Plus,
  Filter,
  ListChecks,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/src/core/presentation/components/ui/card";
import { Badge } from "@/src/core/presentation/components/ui/badge";
import { Button } from "@/src/core/presentation/components/ui/button";
import { Input } from "@/src/core/presentation/components/ui/input";
import { Label } from "@/src/core/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/core/presentation/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/core/presentation/components/ui/dialog";
import { GanttChart, type GanttTask, type TaskStatus } from "./gantt-chart";

const initialTasks: GanttTask[] = [
  {
    id: "LA-001",
    name: "Inspeccion de Valvulas",
    platform: "Plataforma Norte",
    startDate: new Date(2026, 1, 16),
    endDate: new Date(2026, 1, 18),
    status: "completed",
    assignee: "Luis Martinez",
  },
  {
    id: "LA-002",
    name: "Cambio de Sellos Mecanicos",
    platform: "Plataforma Norte",
    startDate: new Date(2026, 1, 19),
    endDate: new Date(2026, 1, 23),
    status: "completed",
    assignee: "Pedro Gonzalez",
  },
  {
    id: "LA-003",
    name: "Calibracion de Sensores",
    platform: "Plataforma Sur",
    startDate: new Date(2026, 1, 20),
    endDate: new Date(2026, 1, 24),
    status: "completed",
    assignee: "Ana Rodriguez",
  },
  {
    id: "LA-004",
    name: "Pruebas de Presion Pozo PF-042",
    platform: "Plataforma Sur",
    startDate: new Date(2026, 1, 23),
    endDate: new Date(2026, 1, 27),
    status: "in-progress",
    assignee: "Roberto Silva",
  },
  {
    id: "LA-005",
    name: "Mantenimiento Generador GE-22",
    platform: "Plataforma Este",
    startDate: new Date(2026, 1, 25),
    endDate: new Date(2026, 2, 2),
    status: "in-progress",
    assignee: "Maria Fernandez",
  },
  {
    id: "LA-006",
    name: "Revision Sistema Electrico",
    platform: "Plataforma Norte",
    startDate: new Date(2026, 1, 26),
    endDate: new Date(2026, 1, 28),
    status: "in-progress",
    assignee: "Enrique Morales",
  },
  {
    id: "LA-007",
    name: "Instalacion Nuevo Compresor",
    platform: "Plataforma Este",
    startDate: new Date(2026, 2, 1),
    endDate: new Date(2026, 2, 5),
    status: "pending",
    assignee: "Diana Lopez",
  },
  {
    id: "LA-008",
    name: "Inspeccion de Tuberias HP",
    platform: "Plataforma Sur",
    startDate: new Date(2026, 2, 2),
    endDate: new Date(2026, 2, 6),
    status: "pending",
    assignee: "Carmen Herrera",
  },
  {
    id: "LA-009",
    name: "Limpieza de Tanques",
    platform: "Plataforma Norte",
    startDate: new Date(2026, 2, 4),
    endDate: new Date(2026, 2, 8),
    status: "pending",
    assignee: "Luis Martinez",
  },
];

import { useLookahead } from "../hooks/use-lookahead";

export function LookaheadContent() {
  const { tasks, stats, addTask } = useLookahead();
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    platform: "",
    startDate: "",
    endDate: "",
    assignee: "",
    status: "pending" as TaskStatus,
  });

  const dateRange = {
    start: new Date(2026, 1, 16), // Feb 16
    end: new Date(2026, 2, 8), // Mar 8
  };

  const filtered =
    filterPlatform === "all"
      ? tasks
      : tasks.filter((t) => t.platform === filterPlatform);

  const handleAddTask = () => {
    if (
      !newTask.name ||
      !newTask.platform ||
      !newTask.startDate ||
      !newTask.endDate ||
      !newTask.assignee
    )
      return;
    addTask(newTask);
    setNewTask({
      name: "",
      platform: "",
      startDate: "",
      endDate: "",
      assignee: "",
      status: "pending",
    });
    setDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 border border-primary/20">
            <CalendarRange className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight">
              Look-a-Head
            </h1>
            <p className="text-sm text-muted-foreground">
              Planificacion y control de tareas por plataforma — Diagrama de
              Gantt
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-3 mr-1.5" />
              Nueva Tarea
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground font-mono">
                Agregar Tarea al Gantt
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                La tarea aparecera automaticamente en el diagrama segun las
                fechas asignadas.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Nombre de la Tarea
                </Label>
                <Input
                  value={newTask.name}
                  onChange={(e) =>
                    setNewTask({ ...newTask, name: e.target.value })
                  }
                  placeholder="Ej: Mantenimiento de Bomba BC-05"
                  className="h-9 text-xs bg-secondary/50 border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Plataforma
                  </Label>
                  <Select
                    value={newTask.platform}
                    onValueChange={(v) =>
                      setNewTask({ ...newTask, platform: v })
                    }
                  >
                    <SelectTrigger className="h-9 text-xs bg-secondary/50 border-border w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="Plataforma Norte">
                        Plataforma Norte
                      </SelectItem>
                      <SelectItem value="Plataforma Sur">
                        Plataforma Sur
                      </SelectItem>
                      <SelectItem value="Plataforma Este">
                        Plataforma Este
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Responsable
                  </Label>
                  <Input
                    value={newTask.assignee}
                    onChange={(e) =>
                      setNewTask({ ...newTask, assignee: e.target.value })
                    }
                    placeholder="Nombre del responsable"
                    className="h-9 text-xs bg-secondary/50 border-border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Fecha Inicio
                  </Label>
                  <Input
                    type="date"
                    value={newTask.startDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, startDate: e.target.value })
                    }
                    className="h-9 text-xs bg-secondary/50 border-border"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Fecha Fin
                  </Label>
                  <Input
                    type="date"
                    value={newTask.endDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, endDate: e.target.value })
                    }
                    className="h-9 text-xs bg-secondary/50 border-border"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Estado</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(v) =>
                    setNewTask({ ...newTask, status: v as TaskStatus })
                  }
                >
                  <SelectTrigger className="h-9 text-xs bg-secondary/50 border-border w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in-progress">En Proceso</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-border"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="text-xs bg-primary text-primary-foreground"
                onClick={handleAddTask}
              >
                Agregar Tarea
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total Tareas",
            value: stats.total,
            icon: ListChecks,
            color: "text-foreground",
          },
          {
            label: "Completadas",
            value: stats.completed,
            icon: CheckCircle2,
            color: "text-emerald-500",
          },
          {
            label: "En Proceso",
            value: stats.inProgress,
            icon: Clock,
            color: "text-primary",
          },
          {
            label: "Pendientes",
            value: stats.pending,
            icon: AlertCircle,
            color: "text-muted-foreground",
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

      {/* Filter */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
          Diagrama de Gantt — Feb 16 a Mar 8, 2026
        </span>
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="h-8 text-xs w-48 bg-secondary/50 border-border">
            <Filter className="size-3 mr-1.5" />
            <SelectValue placeholder="Filtrar plataforma" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todas las plataformas</SelectItem>
            <SelectItem value="Plataforma Norte">Plataforma Norte</SelectItem>
            <SelectItem value="Plataforma Sur">Plataforma Sur</SelectItem>
            <SelectItem value="Plataforma Este">Plataforma Este</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gantt Chart */}
      <GanttChart tasks={filtered} dateRange={dateRange} />
    </div>
  );
}
