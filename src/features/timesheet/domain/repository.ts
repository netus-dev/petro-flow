import { OvertimeRecord, TimesheetStats } from "./entities";

export interface ITimesheetRepository {
  getOvertimeRecords(): Promise<OvertimeRecord[]>;
  getWeeklyStats(): Promise<TimesheetStats>;
}
