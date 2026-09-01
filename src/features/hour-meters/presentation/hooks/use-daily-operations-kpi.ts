"use client";

import { useEffect, useState } from "react";
import { DailyOperationsKpi } from "../../domain/entities";
import { readDailyOperationsKpi } from "../../infrastructure/server/hour-meter-actions";

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
    void readDailyOperationsKpi(assetId).then((result) => {
      if (result.ok) setDailyKpi(result.data);
      else setDailyKpi(null);
      setIsLoading(false);
    });
  }, [assetId]);

  return { dailyKpi, isLoading };
}
