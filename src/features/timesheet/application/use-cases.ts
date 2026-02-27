import {
  TimesheetRequest,
  TimesheetStats,
  ApprovalStatus,
} from "../domain/entities";
import { ITimesheetRepository } from "../domain/repository";

export class GetTimesheetListUseCase {
  constructor(private repository: ITimesheetRepository) {}
  execute(role: string, userId: string): Promise<TimesheetRequest[]> {
    return this.repository.getTimesheetList(role, userId);
  }
}

export class GetTimesheetByIdUseCase {
  constructor(private repository: ITimesheetRepository) {}
  execute(id: string): Promise<TimesheetRequest | undefined> {
    return this.repository.getTimesheetById(id);
  }
}

export class GetTimesheetStatsUseCase {
  constructor(private repository: ITimesheetRepository) {}
  execute(role: string, userId: string): Promise<TimesheetStats> {
    return this.repository.getStats(role, userId);
  }
}

export class SaveTimesheetUseCase {
  constructor(private repository: ITimesheetRepository) {}
  execute(timesheet: TimesheetRequest): Promise<void> {
    return this.repository.saveTimesheet(timesheet);
  }
}

export class UpdateTimesheetStatusUseCase {
  constructor(private repository: ITimesheetRepository) {}
  execute(
    id: string,
    status: ApprovalStatus,
    role: string,
    comment: string,
  ): Promise<void> {
    return this.repository.updateTimesheetStatus(id, status, role, comment);
  }
}
