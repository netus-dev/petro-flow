export type TaskStatus = "completed" | "in-progress" | "pending";

export interface GanttTask {
  id: string;
  name: string;
  platform: string;
  startDate: Date;
  endDate: Date;
  status: TaskStatus;
  assignee: string;
}

export interface LookaheadStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}
