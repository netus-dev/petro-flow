export type DayCategory =
  | "Jornada normal"
  | "Tiempo extra"
  | "Día festivo"
  | "Capacitación";
export type ApprovalStatus =
  | "Borrador"
  | "Pendiente Supervisor"
  | "Pendiente Gerente"
  | "Aprobada"
  | "Rechazada";

export interface TimesheetDay {
  date: string;
  category: DayCategory;
  hoursExtra: number;
}

export interface TimesheetRequest {
  id: string;
  folio: string;
  workerId: string;
  workerName: string;
  role: "Técnico" | "Supervisor" | "Gerente";
  rig: string;
  periodStart: string;
  periodEnd: string;
  days: TimesheetDay[];
  totalExtraHours: number;
  totalNormalDays: number;
  totalHolidayDays: number;
  totalTrainingDays: number;
  status: ApprovalStatus;
  submittedAt: string | null;
  comments: {
    worker?: string;
    supervisor?: string;
    manager?: string;
  };
}

export interface TimesheetStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalExtraHours: number;
  estimatedPayment?: number; // Mock calculation
  recentActivity: {
    id: string;
    actor: string;
    type: "submission" | "approval" | "rejection";
    message: string;
    timestamp: string;
  }[];
}
