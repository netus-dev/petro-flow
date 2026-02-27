import { ITimesheetRepository } from "../domain/repository";
import { OvertimeRecord, TimesheetStats } from "../domain/entities";

export class GetOvertimeRecordsUseCase {
  constructor(private repository: ITimesheetRepository) {}

  async execute(): Promise<OvertimeRecord[]> {
    return this.repository.getOvertimeRecords();
  }
}

export class GetWeeklyStatsUseCase {
  constructor(private repository: ITimesheetRepository) {}

  async execute(): Promise<TimesheetStats> {
    return this.repository.getWeeklyStats();
  }
}
