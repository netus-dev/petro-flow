"use client";

import { useCallback, useEffect, useState } from "react";
import { HourMeterRecord } from "../../domain/entities";
import { RegisterHourMeterInput } from "../../domain/repositories/hour-meter.repository";
import { GetHourMetersUseCase, RegisterHourMeterUseCase } from "../../application/usecases/hour-meter.usecases";
import { readHourMeters, registerHourMeter as registerHourMeterAction } from "../../infrastructure/server/hour-meter-actions";

const repository = {
  getAll: async () => {
    const result = await readHourMeters();
    if (!result.ok) throw new Error(result.error);
    return result.data;
  },
  register: async (input: RegisterHourMeterInput) => {
    const result = await registerHourMeterAction(input);
    if (!result.ok) throw new Error(result.error);
    return result.data;
  },
};
const getHourMeters = new GetHourMetersUseCase(repository);
const registerHourMeter = new RegisterHourMeterUseCase(repository);

/** Keeps the dashboard and registration selector in the agreed operational order. */
function sortHourMeters(records: HourMeterRecord[]): HourMeterRecord[] {
  const order = (equipment: string) => {
    const normalized = equipment.toLowerCase();
    const numbered = normalized.match(/(motor(?:es)?(?: de generador(?:es)?)?|generador|bomba de lodo)\s*(\d+)/);
    if (numbered) {
      const group = numbered[1].includes("bomba") ? 2 : 1;
      return group * 10 + Number(numbered[2]);
    }
    if (normalized.includes("top drive")) return 20;
    if (normalized.includes("malacate")) return 40;
    if (normalized.includes("hpu")) return 41;
    if (normalized.includes("koomey")) return 42;
    return 99;
  };
  return [...records].sort((a, b) => order(a.equipment) - order(b.equipment));
}

/** Presentation adapter for hour-meter reads and manual registration. */
export function useHourMeters(initialRecords: HourMeterRecord[] = []) {
  const [records, setRecords] = useState<HourMeterRecord[]>(initialRecords);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await getHourMeters.execute();
    if (result.isLeft()) setError(result.value.message);
    else { setRecords(sortHourMeters(result.value)); setError(null); }
    setLoading(false);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const addRecord = useCallback(async (input: RegisterHourMeterInput) => {
    const result = await registerHourMeter.execute(input);
    if (result.isLeft()) return { error: result.value.message, errorFieldErrors: result.value.fieldErrors };
    setRecords((current) => sortHourMeters([...current, result.value]));
    return { record: result.value };
  }, []);

  return { records, loading, error, refresh, addRecord };
}
