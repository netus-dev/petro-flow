"use client";

import { useEffect, useState } from "react";
import { DailyOperationsKpi } from "../../domain/entities";
import { GetDailyOperationsKpiUseCase } from "../../application/usecases/hour-meter.usecases";
import { SupabaseHourMeterRepository } from "../../infrastructure/repositories/hour-meter.supabase.repository";

const getDailyKpi = new GetDailyOperationsKpiUseCase(new SupabaseHourMeterRepository());

/** Loads consecutive-reading operational deltas for the selected asset. */
export function useDailyOperationsKpi(assetId: string | null) {
  const [dailyKpi, setDailyKpi] = useState<DailyOperationsKpi | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!assetId) {
      setDailyKpi(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    void getDailyKpi.execute(assetId).then((result) => {
      if (result.isRight()) setDailyKpi(result.value);
      else setDailyKpi(null);
      setIsLoading(false);
    });
  }, [assetId]);

  return { dailyKpi, isLoading };
}
