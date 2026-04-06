"use client";

/**
 * @fileoverview Gantt Chart completo usando @svar-ui/react-gantt.
 *
 * Diseño de eventos:
 * - Cambios de TEXTO/PROGRESO: debounced 600ms (evitar spam a Supabase por keystroke).
 *   NO actualizamos React state → SVAR ya muestra el cambio en su propio estado interno.
 * - Cambios de FECHAS (drag/resize): se aplican al soltar (inProgress=false).
 *   SÍ actualizamos React state (necesario para cascada).
 * - add-task interno: bloqueado (tenemos nuestro propio formulario).
 */

import { useState, useCallback, useMemo, useRef } from "react";
import { Gantt, Toolbar, Editor, ContextMenu, WillowDark } from "@svar-ui/react-gantt";
import type { IApi, ITask } from "@svar-ui/react-gantt";
import "@svar-ui/react-gantt/all.css";
import { Task } from "../../domain/entities";

export interface GanttTaskUpdate {
  text?: string;
  start?: Date;
  end?: Date;
  progress?: number;
}

interface GanttChartProps {
  tasks: Task[];
  onTaskUpdate: (id: string, updates: GanttTaskUpdate, oldStart: Date | null) => void;
  onTaskEdit: (id: string) => void;
  onLinkAdd: (sourceId: string, targetId: string) => void;
  onLinkDelete: (sourceId: string) => void;
  onTaskDelete: (id: string) => void;
}

function statusToProgress(status: Task["status"]): number {
  return status === "completed" ? 100 : status === "in_progress" ? 50 : 0;
}

function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

const TaskBadgeCell = ({ row }: { row: any }) => {
  const task = row;
  const statusStr = task?.status_raw || "pending";
  
  let bg = "bg-white/5"; 
  let textColor = "text-zinc-400"; 
  let label = "PENDIENTE";

  if (statusStr === "in_progress") {
    bg = "bg-orange-500/15";
    textColor = "text-orange-400";
    label = "EN PROCESO";
  } else if (statusStr === "completed") {
    bg = "bg-emerald-500/15";
    textColor = "text-emerald-400";
    label = "COMPLETADA";
  }

  return (
    <div className="flex flex-col justify-center h-full gap-0.5">
      <span className="font-medium text-[13px] truncate leading-none" title={task?.description}>{task?.description || "Tarea"}</span>
      <div>
        <span className={`text-[8px] px-1 py-[1px] rounded font-semibold tracking-wider uppercase ${bg} ${textColor}`}>
          {label}
        </span>
      </div>
    </div>
  );
};

export function GanttChart({
  tasks,
  onTaskUpdate,
  onTaskEdit,
  onLinkAdd,
  onLinkDelete,
  onTaskDelete,
}: GanttChartProps) {
  const [ganttApi, setGanttApi] = useState<IApi | null>(null);

  // Refs para evitar closures stale en callbacks
  const onTaskUpdateRef = useRef(onTaskUpdate);
  const onTaskEditRef   = useRef(onTaskEdit);
  const onLinkAddRef    = useRef(onLinkAdd);
  const onLinkDeleteRef = useRef(onLinkDelete);
  const onTaskDeleteRef = useRef(onTaskDelete);
  const tasksRef        = useRef(tasks);

  onTaskUpdateRef.current = onTaskUpdate;
  onTaskEditRef.current   = onTaskEdit;
  onLinkAddRef.current    = onLinkAdd;
  onLinkDeleteRef.current = onLinkDelete;
  onTaskDeleteRef.current = onTaskDelete;
  tasksRef.current        = tasks;

  const handleInit = useCallback((api: IApi) => {
    // Bloquear add-task interno (tenemos nuestro propio formulario)
    api.intercept("add-task", () => false);

    // Interceptar la apertura del editor de SVAR
    // En su lugar, abrimos nuestro propio modal.
    api.intercept("show-editor", (ev: any) => {
      const strId = String(ev?.id ?? "");
      if (isValidUUID(strId)) {
        onTaskEditRef.current(strId);
      }
      return false; // bloquea el editor interno de SVAR
    });

    api.on("update-task", (ev: any) => {
      const { id, task, inProgress } = ev;

      // Ignorar eventos mid-drag
      if (inProgress) return;

      const strId = String(id);
      if (!isValidUUID(strId)) return;

      const domainTask = tasksRef.current.find((t) => t.id === strId);
      const oldStart   = domainTask ? new Date(domainTask.start_date) : null;

      const hasDateChange = task.start !== undefined || task.end !== undefined;

      if (hasDateChange) {
        const updates: GanttTaskUpdate = {};
        if (task.start !== undefined) updates.start = task.start;
        if (task.end   !== undefined) updates.end   = task.end;
        onTaskUpdateRef.current(strId, updates, oldStart);
      }
    });

    api.on("delete-task", (ev: any) => {
      const strId = String(ev?.id ?? "");
      if (isValidUUID(strId)) onTaskDeleteRef.current(strId);
    });

    api.on("add-link", (ev: any) => {
      const link = ev?.link;
      if (!link?.source || !link?.target) return;
      const src = String(link.source);
      const tgt = String(link.target);
      if (isValidUUID(src) && isValidUUID(tgt)) onLinkAddRef.current(src, tgt);
    });

    api.on("delete-link", (ev: any) => {
      try {
        const state   = api.getState();
        const deleted = state._links?.find((l: any) => l.id === ev?.id);
        if (deleted) {
          const src = String(deleted.source);
          if (isValidUUID(src)) onLinkDeleteRef.current(src);
        }
      } catch { /* ignorar */ }
    });

    setGanttApi(api);
  }, []);

  const ganttTasks = useMemo<ITask[]>(() =>
    tasks.map((task) => {
      const diffMs = new Date(task.end_date).getTime() - new Date(task.start_date).getTime();
      const days = diffMs / (1000 * 60 * 60 * 24);
      let formattedDays = days % 1 === 0 ? String(days) : days.toFixed(2);
      
      // Limpiar ceros a la derecha innecesarios si tiene decimales (ej 1.50 -> 1.5)
      if (formattedDays.includes('.')) {
        formattedDays = formattedDays.replace(/0+$/, '').replace(/\.$/, '');
      }

      return {
        id:       task.id,
        text:     formattedDays, // Muestra la duración dentro de la barra (ej: 0.5, 1)
        description: task.description, // Conserva el nombre para la celda de la tabla
        start:    new Date(task.start_date),
        end:      new Date(task.end_date),
        progress: statusToProgress(task.status),
        type:     "task" as const,
        status_raw: task.status,
      };
    }), [tasks]);

  const ganttLinks = useMemo(() =>
    tasks
      .filter((t) => t.next_task_id)
      .map((t, i) => ({
        id:     i + 1,
        source: t.id,
        target: t.next_task_id!,
        type:   "e2s" as const,
      })), [tasks]);

  if (tasks.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center border border-border rounded-lg bg-card text-muted-foreground gap-2"
        style={{ height: "calc(100vh - 340px)", minHeight: "300px" }}
      >
        <span className="text-sm">No hay tareas para este rig</span>
        <span className="text-xs opacity-60">
          Agrega una tarea con el botón "Nueva Tarea"
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex-1 rounded-lg border border-border w-full flex flex-col relative svar-custom-height"
      style={{ 
        height: "calc(100vh - 340px)", 
        minHeight: "380px",
        "--wx-gantt-row-height": "54px",
        "--wx-grid-row-height": "54px",
      } as React.CSSProperties}
    >
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <WillowDark>
          <Gantt
            tasks={ganttTasks}
            links={ganttLinks}
            zoom={true}
            cellBorders="column"
            lengthUnit="hour"
            scales={[
              { 
                unit: "month", 
                step: 1, 
                format: (d: Date) => {
                  const m = d.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
                  return m.charAt(0).toUpperCase() + m.slice(1);
                }
              },
              { 
                unit: "day", 
                step: 1, 
                format: (d: Date) => d.getDate().toString() 
              }
            ]}
            durationUnit="hour"
            init={handleInit}
          columns={[
            { 
              id: "desc", 
              header: "Tarea", 
              flexgrow: 1, 
              resize: true,
              cell: TaskBadgeCell
            },
            { 
              id: "start", 
              header: "Inicio", 
              width: 120, 
              resize: true,
              cell: ({ row }: { row: any }) => {
                if (!row.start) return <span>-</span>;
                const date = new Date(row.start);
                if (isNaN(date.getTime())) return <span>-</span>;
                const pad = (n: number) => n.toString().padStart(2, "0");
                const formatted = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
                return <span className="text-[11px] text-muted-foreground whitespace-nowrap">{formatted}</span>;
              }
            },
            { 
              id: "end", // Añadimos la columna Fin para precisión
              header: "Fin", 
              width: 120, 
              resize: true,
              cell: ({ row }: { row: any }) => {
                if (!row.end) return <span>-</span>;
                const date = new Date(row.end);
                if (isNaN(date.getTime())) return <span>-</span>;
                const pad = (n: number) => n.toString().padStart(2, "0");
                const formatted = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
                return <span className="text-[11px] text-muted-foreground whitespace-nowrap">{formatted}</span>;
              }
            },
            { 
              id: "duration", 
              header: "Días", 
              width: 60,
              cell: ({ row }: { row: any }) => <span className="text-[11px] font-medium">{row.text}</span>
            },
          ]}
        />
        </WillowDark>
      </div>
    </div>
  );
}
