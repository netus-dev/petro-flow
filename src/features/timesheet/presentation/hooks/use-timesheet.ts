import { useState, useEffect, useMemo } from "react";
import { OvertimeRecord, TimesheetStats } from "../../domain/entities";
import { MockTimesheetRepository } from "../../infrastructure/repository";
import {
  GetOvertimeRecordsUseCase,
  GetWeeklyStatsUseCase,
} from "../../application/use-cases";

export function useTimesheet() {
  const [records, setRecords] = useState<OvertimeRecord[]>([]);
  const [stats, setStats] = useState<TimesheetStats | null>(null);
  const [loading, setLoading] = useState(true);

  const repository = useMemo(() => new MockTimesheetRepository(), []);
  const getRecordsUseCase = useMemo(
    () => new GetOvertimeRecordsUseCase(repository),
    [repository],
  );
  const getStatsUseCase = useMemo(
    () => new GetWeeklyStatsUseCase(repository),
    [repository],
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [recordsData, statsData] = await Promise.all([
        getRecordsUseCase.execute(),
        getStatsUseCase.execute(),
      ]);
      setRecords(recordsData);
      setStats(statsData);
      setLoading(false);
    };

    fetchData();
  }, [getRecordsUseCase, getStatsUseCase]);

  return {
    records,
    stats,
    loading,
  };
}
