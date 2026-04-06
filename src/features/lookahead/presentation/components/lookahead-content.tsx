"use client";

/**
 * @fileoverview Componente principal del módulo Look-a-Head.
 * Layout: header + stats + selector-rig + Gantt (fill height).
 */

import {
  CalendarRange, Plus, Filter,
  ListChecks, Clock, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/src/core/presentation/components/ui/card";
import { Button } from "@/src/core/presentation/components/ui/button";
import { Input } from "@/src/core/presentation/components/ui/input";
import { Label } from "@/src/core/presentation/components/ui/label";
import { Textarea } from "@/src/core/presentation/components/ui/textarea";
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
import { GanttChart } from "./gantt-chart";
import { useLookahead } from "../hooks/use-lookahead";
import { TaskStatus } from "../../domain/entities";

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending:     "Pendiente",
  in_progress: "En Proceso",
  completed:   "Completada",
};

export function LookaheadContent() {
  const {
    rigs, selectedRigId, handleRigChange, loadingRigs,
    tasks, loadingTasks, stats, error,
    dialogOpen, setDialogOpen,
    newTaskForm, setNewTaskForm,
    creating, handleCreateTask,
    handleGanttTaskUpdate,
    handleLinkAdd,
    handleLinkDelete,
    handleDeleteTask,
    editingTaskId,
    setEditingTaskId,
    editTaskForm,
    setEditTaskForm,
    updatingTask,
    openEditTaskModal,
    handleSaveEditTask,
  } = useLookahead();

  return (
    <div className="flex flex-col gap-5 p-6 h-full min-w-0">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 border border-primary/20">
            <CalendarRange className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight">
              Look-a-Head
            </h1>
            <p className="text-sm text-muted-foreground">
              Planificación y control de tareas por plataforma — Diagrama de Gantt
            </p>
          </div>
        </div>

        {/* Dialog: Nueva Tarea */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!selectedRigId}
            >
              <Plus className="size-3 mr-1.5" />
              Nueva Tarea
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground font-mono">
                Agregar Tarea al Gantt
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                La tarea se asignará al rig seleccionado y aparecerá en el diagrama.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              {/* Descripción */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Descripción <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  placeholder="Ej: Mantenimiento de Bomba BC-05"
                  className="h-9 text-xs bg-secondary/50 border-border"
                />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Fecha Inicio <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    value={newTaskForm.start_date}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, start_date: e.target.value })}
                    className="h-9 text-xs bg-secondary/50 border-border"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Fecha Fin <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    value={newTaskForm.end_date}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, end_date: e.target.value })}
                    className="h-9 text-xs bg-secondary/50 border-border"
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Estado</Label>
                <Select
                  value={newTaskForm.status}
                  onValueChange={(v) => setNewTaskForm({ ...newTaskForm, status: v as TaskStatus })}
                >
                  <SelectTrigger className="h-9 text-xs bg-secondary/50 border-border w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dependencia */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Depende de (Inicio tras finalización)</Label>
                <Select
                  value={newTaskForm.previous_task_id || "none"}
                  onValueChange={(v) => setNewTaskForm({ ...newTaskForm, previous_task_id: v })}
                >
                  <SelectTrigger className="h-9 text-xs bg-secondary/50 border-border w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="none">Ninguna</SelectItem>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>{task.description}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Comentarios */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Comentarios <span className="opacity-50 text-[10px]">(opcional)</span>
                </Label>
                <Textarea
                  value={newTaskForm.comments}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, comments: e.target.value })}
                  placeholder="Información adicional..."
                  className="text-xs bg-secondary/50 border-border resize-none h-16"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-border"
                onClick={() => setDialogOpen(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="text-xs bg-primary text-primary-foreground"
                onClick={handleCreateTask}
                disabled={
                  creating ||
                  !newTaskForm.description ||
                  !newTaskForm.start_date ||
                  !newTaskForm.end_date
                }
              >
                {creating ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="size-3 animate-spin" />
                    Guardando...
                  </span>
                ) : "Agregar Tarea"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg shrink-0">
          {error}
        </div>
      )}

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 shrink-0">
        {[
          { label: "Total",       value: stats.total,      icon: ListChecks,   color: "text-foreground"      },
          { label: "Completadas", value: stats.completed,  icon: CheckCircle2, color: "text-emerald-500"     },
          { label: "En Proceso",  value: stats.inProgress, icon: Clock,        color: "text-primary"         },
          { label: "Pendientes",  value: stats.pending,    icon: AlertCircle,  color: "text-muted-foreground" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex items-center justify-center size-8 rounded-md bg-secondary/50">
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-mono tabular-nums text-foreground">
                  {loadingTasks ? "—" : stat.value}
                </span>
                <span className="text-[9px] tracking-wider uppercase text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Selector de Rig ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between shrink-0">
        <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
          Diagrama de Gantt
        </span>
        {loadingRigs ? (
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Loader2 className="size-3 animate-spin" />
            Cargando rigs...
          </div>
        ) : (
          <Select value={selectedRigId} onValueChange={handleRigChange}>
            <SelectTrigger className="h-8 text-xs w-52 bg-secondary/50 border-border">
              <Filter className="size-3 mr-1.5" />
              <SelectValue placeholder="Seleccionar rig" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {rigs.map((rig) => (
                <SelectItem key={rig.id} value={rig.id}>{rig.name}</SelectItem>
              ))}
              {rigs.length === 0 && (
                <SelectItem value="empty" disabled>Sin rigs disponibles</SelectItem>
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* ── Gantt (fill height) ───────────────────────────────────────────────── */}
      {loadingTasks ? (
        <div className="flex items-center justify-center flex-1 min-h-[300px] border border-border rounded-lg bg-card text-muted-foreground gap-2">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm">Cargando tareas...</span>
        </div>
      ) : (
        <GanttChart
          tasks={tasks}
          onTaskUpdate={handleGanttTaskUpdate}
          onTaskEdit={openEditTaskModal}
          onLinkAdd={handleLinkAdd}
          onLinkDelete={handleLinkDelete}
          onTaskDelete={handleDeleteTask}
        />
      )}

      {/* ── Dialog: Editar Tarea ───────────────────────────────────────────── */}
      <Dialog open={!!editingTaskId} onOpenChange={(open) => !open && setEditingTaskId(null)}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground font-mono">
              Editar Tarea
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Actualiza los detalles de la tarea.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Descripción <span className="text-red-400">*</span>
              </Label>
              <Input
                value={editTaskForm.description}
                onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
                className="h-9 text-xs bg-secondary/50 border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Fecha Inicio</Label>
                <Input
                  type="datetime-local"
                  value={editTaskForm.start_date}
                  onChange={(e) => setEditTaskForm({ ...editTaskForm, start_date: e.target.value })}
                  className="h-9 text-xs bg-secondary/50 border-border"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Fecha Fin</Label>
                <Input
                  type="datetime-local"
                  value={editTaskForm.end_date}
                  onChange={(e) => setEditTaskForm({ ...editTaskForm, end_date: e.target.value })}
                  className="h-9 text-xs bg-secondary/50 border-border"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <Select
                value={editTaskForm.status}
                onValueChange={(v) => setEditTaskForm({ ...editTaskForm, status: v as TaskStatus })}
              >
                <SelectTrigger className="h-9 text-xs bg-secondary/50 border-border w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Depende de (Inicio tras finalización)</Label>
              <Select
                value={editTaskForm.previous_task_id || "none"}
                onValueChange={(v) => setEditTaskForm({ ...editTaskForm, previous_task_id: v })}
              >
                <SelectTrigger className="h-9 text-xs bg-secondary/50 border-border w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="none">Ninguna</SelectItem>
                  {tasks
                    .filter((task) => task.id !== editingTaskId) // evitar dependencia circular a sí misma
                    .map((task) => (
                      <SelectItem key={task.id} value={task.id}>{task.description}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Comentarios</Label>
              <Textarea
                value={editTaskForm.comments}
                onChange={(e) => setEditTaskForm({ ...editTaskForm, comments: e.target.value })}
                className="text-xs bg-secondary/50 border-border resize-none h-16"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="destructive"
              size="sm"
              className="text-xs"
              onClick={() => {
                if (editingTaskId && confirm("¿Eliminar esta tarea?")) {
                  handleDeleteTask(editingTaskId);
                  setEditingTaskId(null);
                }
              }}
              disabled={updatingTask}
            >
              Eliminar
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-border"
                onClick={() => setEditingTaskId(null)}
                disabled={updatingTask}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="text-xs bg-primary text-primary-foreground"
                onClick={handleSaveEditTask}
                disabled={
                  updatingTask ||
                  !editTaskForm.description ||
                  !editTaskForm.start_date ||
                  !editTaskForm.end_date
                }
              >
                {updatingTask ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="size-3 animate-spin" />
                    Guardando...
                  </span>
                ) : "Guardar Cambios"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
