import {
  TimesheetRequest,
  TimesheetStats,
  DayCategory,
  ApprovalStatus,
} from "../domain/entities";
import { ITimesheetRepository } from "../domain/repository";

const generateDays = (
  start: string,
  end: string,
  category: DayCategory = "Jornada normal",
): any[] => {
  const days = [];
  let current = new Date(start);
  const finish = new Date(end);
  while (current <= finish) {
    days.push({
      date: current.toISOString().split("T")[0],
      category: category,
      hoursExtra: 0,
    });
    current.setDate(current.getDate() + 1);
  }
  return days;
};

const mockTimesheets: TimesheetRequest[] = [
  {
    id: "TS-2026-001",
    folio: "FMS-TS-22940",
    workerId: "USR-101",
    workerName: "Juan Pérez",
    role: "Técnico",
    rig: "702",
    periodStart: "2026-01-01",
    periodEnd: "2026-01-15",
    days: [
      { date: "2026-01-01", category: "Jornada normal", hoursExtra: 0 },
      { date: "2026-01-02", category: "Tiempo extra", hoursExtra: 4 },
      { date: "2026-01-03", category: "Tiempo extra", hoursExtra: 4 },
      { date: "2026-01-04", category: "Jornada normal", hoursExtra: 0 },
      { date: "2026-01-05", category: "Día festivo", hoursExtra: 8 },
      ...generateDays("2026-01-06", "2026-01-15"),
    ],
    totalExtraHours: 16,
    totalNormalDays: 14,
    totalHolidayDays: 1,
    totalTrainingDays: 0,
    status: "Pendiente Supervisor",
    submittedAt: "2026-01-16T10:00:00Z",
    comments: {
      worker: "Mantenimiento preventivo extendido en subestructura.",
    },
  },
  {
    id: "TS-2026-002",
    folio: "FMS-TS-22941",
    workerId: "USR-102",
    workerName: "Andrés García",
    role: "Técnico",
    rig: "703",
    periodStart: "2026-01-01",
    periodEnd: "2026-01-15",
    days: generateDays("2026-01-01", "2026-01-15", "Jornada normal"),
    totalExtraHours: 0,
    totalNormalDays: 15,
    totalHolidayDays: 0,
    totalTrainingDays: 0,
    status: "Aprobada",
    submittedAt: "2026-01-15T18:00:00Z",
    comments: {
      worker: "Quincena sin novedades.",
      supervisor: "Validado.",
      manager: "Aprobación final.",
    },
  },
  {
    id: "TS-2026-003",
    folio: "FMS-TS-22942",
    workerId: "USR-103",
    workerName: "Carlos Méndez",
    role: "Supervisor",
    rig: "702",
    periodStart: "2026-01-01",
    periodEnd: "2026-01-15",
    days: generateDays("2026-01-01", "2026-01-15"),
    totalExtraHours: 8,
    totalNormalDays: 15,
    totalHolidayDays: 0,
    totalTrainingDays: 0,
    status: "Pendiente Gerente",
    submittedAt: "2026-01-16T09:00:00Z",
    comments: {
      worker: "Supervisión de cambio de lodos.",
      supervisor: "Solicitud propia validada por flujo.",
    },
  },
];

export class MockTimesheetRepository implements ITimesheetRepository {
  async getTimesheetList(
    role: string,
    userId: string,
  ): Promise<TimesheetRequest[]> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    if (role === "Técnico") {
      return mockTimesheets.filter((ts) => ts.workerId === userId);
    }

    // For Supervisor or Manager, show all relevant to them
    return mockTimesheets;
  }

  async getTimesheetById(id: string): Promise<TimesheetRequest | undefined> {
    return mockTimesheets.find((ts) => ts.id === id);
  }

  async getStats(role: string, userId: string): Promise<TimesheetStats> {
    const list = await this.getTimesheetList(role, userId);

    const stats: TimesheetStats = {
      totalRequests: list.length,
      pendingRequests: list.filter((ts) => ts.status.startsWith("Pendiente"))
        .length,
      approvedRequests: list.filter((ts) => ts.status === "Aprobada").length,
      rejectedRequests: list.filter((ts) => ts.status === "Rechazada").length,
      totalExtraHours: list.reduce((acc, ts) => acc + ts.totalExtraHours, 0),
      estimatedPayment: list.reduce(
        (acc, ts) => acc + ts.totalExtraHours * 45.5,
        0,
      ),
      recentActivity: [
        {
          id: "act-1",
          actor: "Juan Pérez",
          type: "submission",
          message: "Solicitud enviada - RIG 702",
          timestamp: "Hace 2 horas",
        },
        {
          id: "act-2",
          actor: "Andrés García",
          type: "approval",
          message: "Solicitud aprobada final",
          timestamp: "Hace 1 día",
        },
      ],
    };

    return stats;
  }

  async saveTimesheet(timesheet: TimesheetRequest): Promise<void> {
    const index = mockTimesheets.findIndex((ts) => ts.id === timesheet.id);
    if (index >= 0) {
      mockTimesheets[index] = timesheet;
    } else {
      mockTimesheets.push(timesheet);
    }
  }

  async updateTimesheetStatus(
    id: string,
    status: ApprovalStatus,
    role: string,
    comment: string,
  ): Promise<void> {
    const ts = mockTimesheets.find((t) => t.id === id);
    if (ts) {
      ts.status = status;
      if (role === "Supervisor") ts.comments.supervisor = comment;
      if (role === "Gerente") ts.comments.manager = comment;
    }
  }
}
