import { useState, useEffect, useMemo } from "react";
import { OdometerRecord, OrometerStats } from "../../domain/entities";

const initialRecords: OdometerRecord[] = [
  {
    id: "ODO-001",
    platform: "Plataforma Norte",
    equipment: "Motor Principal MP-01",
    currentReading: 4280,
    previousReading: 4100,
    unit: "hrs",
    lastUpdated: "2026-02-27",
    maxThreshold: 5000,
    status: "warning",
  },
  {
    id: "ODO-002",
    platform: "Plataforma Norte",
    equipment: "Compresor CG-04",
    currentReading: 2150,
    previousReading: 2000,
    unit: "hrs",
    lastUpdated: "2026-02-27",
    maxThreshold: 6000,
    status: "normal",
  },
  {
    id: "ODO-003",
    platform: "Plataforma Sur",
    equipment: "Bomba de Inyeccion BI-12",
    currentReading: 5800,
    previousReading: 5600,
    unit: "hrs",
    lastUpdated: "2026-02-26",
    maxThreshold: 6000,
    status: "critical",
  },
  {
    id: "ODO-004",
    platform: "Plataforma Sur",
    equipment: "Generador GE-07",
    currentReading: 3400,
    previousReading: 3200,
    unit: "hrs",
    lastUpdated: "2026-02-27",
    maxThreshold: 8000,
    status: "normal",
  },
  {
    id: "ODO-005",
    platform: "Plataforma Este",
    equipment: "Motor Auxiliar MA-03",
    currentReading: 1900,
    previousReading: 1800,
    unit: "hrs",
    lastUpdated: "2026-02-27",
    maxThreshold: 5000,
    status: "normal",
  },
  {
    id: "ODO-006",
    platform: "Plataforma Este",
    equipment: "Turbina de Gas TG-01",
    currentReading: 7200,
    previousReading: 7000,
    unit: "hrs",
    lastUpdated: "2026-02-25",
    maxThreshold: 8000,
    status: "warning",
  },
];

export function useOrometers() {
  const [records, setRecords] = useState<OdometerRecord[]>(initialRecords);
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    return {
      total: records.length,
      normal: records.filter((r) => r.status === "normal").length,
      warning: records.filter((r) => r.status === "warning").length,
      critical: records.filter((r) => r.status === "critical").length,
      avgUsage: Math.round(
        records.reduce(
          (acc, r) => acc + (r.currentReading / r.maxThreshold) * 100,
          0,
        ) / records.length,
      ),
    };
  }, [records]);

  const addRecord = (newRecord: {
    platform: string;
    equipment: string;
    reading: string;
    maxThreshold: string;
  }) => {
    const reading = parseInt(newRecord.reading);
    const max = parseInt(newRecord.maxThreshold);
    const usage = reading / max;
    const record: OdometerRecord = {
      id: `ODO-${String(records.length + 1).padStart(3, "0")}`,
      platform: newRecord.platform,
      equipment: newRecord.equipment,
      currentReading: reading,
      previousReading: Math.round(reading * 0.95),
      unit: "hrs",
      lastUpdated: new Date().toISOString().split("T")[0],
      maxThreshold: max,
      status: usage > 0.9 ? "critical" : usage > 0.75 ? "warning" : "normal",
    };
    setRecords([...records, record]);
  };

  return {
    records,
    stats,
    loading,
    addRecord,
  };
}
