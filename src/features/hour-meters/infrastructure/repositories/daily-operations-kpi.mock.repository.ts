import { DailyOperationsKpi } from "../../domain/entities";
import { IDailyOperationsKpiRepository } from "../../domain/repositories/hour-meter.repository";

/** Infrastructure-owned mock for the latest operational aggregates. */
export class MockDailyOperationsKpiRepository implements IDailyOperationsKpiRepository {
  async getLast24Hours(): Promise<DailyOperationsKpi> {
    return { dieselGallons: 1840, generatedMw: 286.7, lastUpdated: new Date().toISOString() };
  }
}
