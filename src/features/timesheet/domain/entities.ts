export type OvertimeStatus = "approved" | "pending" | "rejected";

export interface OvertimeRecord {
  id: string;
  worker: string;
  workerRole: string;
  platform: string;
  date: string;
  hoursRegular: number;
  hoursOvertime: number;
  reason: string;
  authorizedBy: string | null;
  authorizedDate: string | null;
  completedDate: string | null;
  status: OvertimeStatus;
}

export interface TimesheetStats {
  totalOvertime: number;
  approved: number;
  pending: number;
  rejected: number;
  totalWorkers: number;
}
