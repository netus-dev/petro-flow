import { useState, useMemo } from "react";
import { GanttTask, LookaheadStats } from "../../domain/entities";

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

export function useLookahead() {
  const [tasks, setTasks] = useState<GanttTask[]>(initialTasks);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      pending: tasks.filter((t) => t.status === "pending").length,
    };
  }, [tasks]);

  const addTask = (newTask: {
    name: string;
    platform: string;
    startDate: string;
    endDate: string;
    assignee: string;
    status: any;
  }) => {
    const task: GanttTask = {
      id: `LA-${String(tasks.length + 1).padStart(3, "0")}`,
      name: newTask.name,
      platform: newTask.platform,
      startDate: new Date(newTask.startDate),
      endDate: new Date(newTask.endDate),
      status: newTask.status,
      assignee: newTask.assignee,
    };
    setTasks([...tasks, task]);
  };

  return {
    tasks,
    stats,
    addTask,
  };
}
