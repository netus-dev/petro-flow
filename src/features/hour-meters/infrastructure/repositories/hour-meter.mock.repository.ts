import { HourMeterRecord } from "../../domain/entities";
import { IHourMeterRepository, RegisterHourMeterInput } from "../../domain/repositories/hour-meter.repository";
import { toHourMeterDto, toHourMeterRecord } from "../mappers/hour-meter.mapper";

const seedData: Array<[string, string, string, number, number]> = [
  ["ODO-001", "Plataforma Norte", "Motor de Generador 01", 4280, 5000],
  ["ODO-002", "Plataforma Norte", "Motor de Generador 02", 2150, 6000],
  ["ODO-003", "Plataforma Sur", "Motor de Generador 03", 5800, 6000],
  ["ODO-004", "Plataforma Sur", "Motor de Generador 04", 3400, 8000],
  ["ODO-005", "Plataforma Este", "Motor de Generador 05", 1900, 5000],
  ["ODO-006", "Plataforma Este", "Bomba de Lodo 01", 7200, 8000],
  ["ODO-007", "Plataforma Norte", "Bomba de Lodo 02", 4280, 5000],
  ["ODO-008", "Plataforma Norte", "Bomba de Lodo 03", 2150, 6000],
  ["ODO-009", "Plataforma Sur", "Top Drive", 5800, 6000],
  ["ODO-010", "Plataforma Sur", "Malacate", 3400, 8000],
  ["ODO-011", "Plataforma Este", "HPU", 1900, 5000],
  ["ODO-012", "Plataforma Este", "Bomba Koomey", 7200, 8000],
];
const seed: HourMeterRecord[] = seedData.map(([id, platform, equipment, reading, maxThreshold]) => toHourMeterRecord({
  id,
  platform,
  equipment,
  currentReading: reading,
  previousReading: Math.round(reading * 0.95),
  unit: "hrs",
  lastUpdated: "2026-02-27",
  maxThreshold,
  lastMaintenanceDate: "2026-02-15",
  lastMaintenanceReading: Math.round(reading * 0.9),
  dieselAccumulatedGallons: 15000,
  dailyMwAccumulated: 12.4,
  dailyMvarAccumulated: 3.2,
}));

/** Infrastructure-owned in-memory repository used by the V1 MVP. */
export class MockHourMeterRepository implements IHourMeterRepository {
  private records = [...seed];

  async getAll(): Promise<HourMeterRecord[]> {
    return this.records.map((record) => ({ ...record }));
  }

  async register(input: RegisterHourMeterInput): Promise<HourMeterRecord> {
    const id = `ODO-${String(this.records.length + 1).padStart(3, "0")}`;
    const record = toHourMeterRecord(toHourMeterDto(input, id));
    this.records = [...this.records, record];
    return { ...record };
  }
}
