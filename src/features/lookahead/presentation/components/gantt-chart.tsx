"use client"

import { useMemo, useRef } from "react"
import { format, eachDayOfInterval, isWeekend, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/src/core/presentation/components/ui/badge"

export type TaskStatus = "completed" | "in-progress" | "pending"

export interface GanttTask {
  id: string
  name: string
  platform: string
  startDate: Date
  endDate: Date
  status: TaskStatus
  assignee: string
}

interface GanttChartProps {
  tasks: GanttTask[]
  dateRange: { start: Date; end: Date }
}

function getBarColor(status: TaskStatus) {
  if (status === "completed") return "bg-emerald-500/80"
  if (status === "in-progress") return "bg-primary/80"
  return "bg-muted-foreground/40"
}

function getBarBorder(status: TaskStatus) {
  if (status === "completed") return "border-emerald-500/30"
  if (status === "in-progress") return "border-primary/30"
  return "border-muted-foreground/20"
}

export function GanttChart({ tasks, dateRange }: GanttChartProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const days = useMemo(
    () => eachDayOfInterval({ start: dateRange.start, end: dateRange.end }),
    [dateRange]
  )

  const today = new Date()
  const colWidth = 44 // px per day column
  const rowHeight = 44 // px per row
  const labelWidth = 240 // px for task label column

  return (
    <div className="flex flex-col border border-border rounded-lg bg-card overflow-hidden">
      {/* Scrollable container */}
      <div className="flex overflow-hidden">
        {/* Fixed left: Task names */}
        <div
          className="shrink-0 border-r border-border bg-card z-10"
          style={{ width: labelWidth }}
        >
          {/* Header cell */}
          <div
            className="flex items-center px-3 border-b border-border bg-secondary/30"
            style={{ height: rowHeight }}
          >
            <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground">
              Tarea / Plataforma
            </span>
          </div>
          {/* Task labels */}
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 px-3 border-b border-border/50 hover:bg-secondary/20 transition-colors"
              style={{ height: rowHeight }}
            >
              <span
                className={`size-2 rounded-full shrink-0 ${
                  task.status === "completed"
                    ? "bg-emerald-500"
                    : task.status === "in-progress"
                      ? "bg-primary"
                      : "bg-muted-foreground"
                }`}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-medium text-foreground truncate">
                  {task.name}
                </span>
                <span className="text-[9px] text-muted-foreground truncate">
                  {task.platform} — {task.assignee}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable right: Gantt bars */}
        <div className="flex-1 overflow-x-auto" ref={scrollRef}>
          <div style={{ minWidth: days.length * colWidth }}>
            {/* Date headers */}
            <div
              className="flex border-b border-border bg-secondary/30"
              style={{ height: rowHeight }}
            >
              {days.map((day, i) => {
                const isToday = isSameDay(day, today)
                const weekend = isWeekend(day)
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center justify-center shrink-0 border-r border-border/30 ${
                      isToday
                        ? "bg-primary/10"
                        : weekend
                          ? "bg-secondary/50"
                          : ""
                    }`}
                    style={{ width: colWidth }}
                  >
                    <span
                      className={`text-[9px] uppercase ${
                        isToday ? "text-primary font-bold" : "text-muted-foreground"
                      }`}
                    >
                      {format(day, "EEE", { locale: es })}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        isToday ? "text-primary font-bold" : "text-foreground"
                      }`}
                    >
                      {format(day, "dd")}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Task rows with bars */}
            {tasks.map((task) => {
              const startOffset = Math.max(
                0,
                Math.round(
                  (task.startDate.getTime() - dateRange.start.getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              )
              const duration = Math.max(
                1,
                Math.round(
                  (task.endDate.getTime() - task.startDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1
              )

              return (
                <div
                  key={task.id}
                  className="relative border-b border-border/50"
                  style={{ height: rowHeight }}
                >
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex">
                    {days.map((day, i) => {
                      const isToday = isSameDay(day, today)
                      const weekend = isWeekend(day)
                      return (
                        <div
                          key={i}
                          className={`shrink-0 border-r border-border/20 ${
                            isToday
                              ? "bg-primary/5"
                              : weekend
                                ? "bg-secondary/20"
                                : ""
                          }`}
                          style={{ width: colWidth }}
                        />
                      )
                    })}
                  </div>

                  {/* Bar */}
                  <div
                    className="absolute top-2 flex items-center"
                    style={{
                      left: startOffset * colWidth + 2,
                      width: duration * colWidth - 4,
                      height: rowHeight - 16,
                    }}
                  >
                    <div
                      className={`h-full w-full rounded-md border ${getBarColor(task.status)} ${getBarBorder(task.status)} flex items-center px-2 overflow-hidden`}
                    >
                      <span className="text-[9px] font-medium text-foreground truncate">
                        {task.name}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-secondary/20">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-emerald-500/80" />
          <span className="text-[9px] text-muted-foreground">Completada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-primary/80" />
          <span className="text-[9px] text-muted-foreground">En Proceso</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-muted-foreground/40" />
          <span className="text-[9px] text-muted-foreground">Pendiente</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="size-2.5 rounded-sm bg-primary/10 border border-primary/30" />
          <span className="text-[9px] text-muted-foreground">Hoy</span>
        </div>
      </div>
    </div>
  )
}
