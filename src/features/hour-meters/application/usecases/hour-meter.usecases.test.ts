import { describe, expect, it } from "vitest";
import { GetDailyOperationsKpiUseCase, GetHourMetersUseCase, RegisterHourMeterUseCase } from "./hour-meter.usecases";
import { MockHourMeterRepository } from "../../infrastructure/repositories/hour-meter.mock.repository";
import { requiresOperationalAccumulatedFields } from "../../domain/entities";

describe("hour-meter use cases", () => {
  it("passes the selected asset to the daily KPI repository", async () => {
    const repository = { getLast24Hours: async (assetId: string) => ({ assetId, dieselGallons: 12, generatedMw: 3, lastUpdated: "2026-01-01T00:00:00Z" }) };
    const result = await new GetDailyOperationsKpiUseCase(repository).execute("asset-42");
    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value).toMatchObject({ dieselGallons: 12, generatedMw: 3 });
  });

  it("reads infrastructure mock data through the repository", async () => {
    const result = await new GetHourMetersUseCase(new MockHourMeterRepository()).execute();
    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value).toHaveLength(12);
  });

  it("identifies generator engines from functional principle or equipment names", () => {
    expect(requiresOperationalAccumulatedFields({ equipment: "Motor del generador 01", functionalPrincipleName: "Motor de Combustión Interna" })).toBe(true);
    expect(requiresOperationalAccumulatedFields({ equipment: "Motor de Generador 01" })).toBe(true);
    expect(requiresOperationalAccumulatedFields({ equipment: "Bomba de Lodo 01", functionalPrincipleName: "Bomba de Lodo" })).toBe(false);
  });

  it("registers a generator-engine reading with the captured operational values", async () => {
    const repository = new MockHourMeterRepository();
    const result = await new RegisterHourMeterUseCase(repository).execute({
      assetId: "ODO-001", capturedAt: "2026-08-27T10:00", currentReading: 4281, dieselAccumulatedGallons: 15001, dailyMwAccumulated: 12.5, dailyMvarAccumulated: 3.3,
    });
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.status).toBe("warning");
      expect(result.value.dailyMwAccumulated).toBe(12.5);
      expect(result.value.dieselAccumulatedGallons).toBe(15001);
    }
    expect(await repository.getAll()).toHaveLength(13);
  });

  it("registers a non-generator asset without operational values", async () => {
    const repository = new MockHourMeterRepository();
    const result = await new RegisterHourMeterUseCase(repository).execute({
      assetId: "ODO-006", capturedAt: "2026-08-27T10:00", currentReading: 7201,
    });
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.dieselAccumulatedGallons).toBeNull();
      expect(result.value.dailyMwAccumulated).toBeNull();
      expect(result.value.dailyMvarAccumulated).toBeNull();
    }
  });

  it("returns a Left for invalid required readings", async () => {
    const result = await new RegisterHourMeterUseCase(new MockHourMeterRepository()).execute({
      assetId: "", capturedAt: "", currentReading: 10,
    });
    expect(result.isLeft()).toBe(true);
  });

  it("rejects generator-engine readings below the selected asset's last values", async () => {
    const result = await new RegisterHourMeterUseCase(new MockHourMeterRepository()).execute({
      assetId: "ODO-001", capturedAt: "2026-08-27T10:00", currentReading: 4279,
      dieselAccumulatedGallons: 14999, dailyMwAccumulated: 12.3, dailyMvarAccumulated: 3.1,
    });
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) expect(result.value.message).toContain("no pueden ser menores");
  });

  it("does not apply operational monotonic validation to non-generator assets", async () => {
    const result = await new RegisterHourMeterUseCase(new MockHourMeterRepository()).execute({
      assetId: "ODO-006", capturedAt: "2026-08-27T10:00", currentReading: 7201,
      dieselAccumulatedGallons: 1, dailyMwAccumulated: 1, dailyMvarAccumulated: 1,
    });
    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.dieselAccumulatedGallons).toBeNull();
  });
});
