import { TimesheetRequest, TimesheetStats } from "./entities";

export interface ITimesheetRepository {
  getTimesheetList(role: string, userId: string): Promise<TimesheetRequest[]>;
  getTimesheetById(id: string): Promise<TimesheetRequest | undefined>;
  getStats(role: string, userId: string): Promise<TimesheetStats>;
  saveTimesheet(timesheet: TimesheetRequest): Promise<void>;
  updateTimesheetStatus(
    id: string,
    status: TimesheetRequest["status"],
    role: string,
    comment: string,
  ): Promise<void>;
}
