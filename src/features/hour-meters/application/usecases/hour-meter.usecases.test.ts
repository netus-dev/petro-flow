import { describe, expect, it } from "vitest";
import { GetDailyOperationsKpiUseCase, GetHourMetersUseCase, RegisterHourMeterUseCase } from "./hour-meter.usecases";
import { MockHourMeterRepository } from "../../infrastructure/repositories/hour-meter.mock.repository";

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

  it("registers a reading with the captured operational values", async () => {
    const repository = new MockHourMeterRepository();
    const result = await new RegisterHourMeterUseCase(repository).execute({
        assetId: "Bomba nueva", capturedAt: "2026-08-27T10:00", currentReading: 800, dieselAccumulatedGallons: 15000, dailyMwAccumulated: 12.4, dailyMvarAccumulated: 3.2,
    });
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.status).toBe("normal");
      expect(result.value.dailyMwAccumulated).toBe(12.4);
      expect(result.value.dieselAccumulatedGallons).toBe(15000);
    }
    expect(await repository.getAll()).toHaveLength(13);
  });

  it("returns a Left for invalid readings", async () => {
    const result = await new RegisterHourMeterUseCase(new MockHourMeterRepository()).execute({
      assetId: "", capturedAt: "", currentReading: 10, dieselAccumulatedGallons: 0, dailyMwAccumulated: 0, dailyMvarAccumulated: 0,
    });
    expect(result.isLeft()).toBe(true);
  });

  it("rejects readings below the selected asset's last values", async () => {
    const result = await new RegisterHourMeterUseCase(new MockHourMeterRepository()).execute({
      assetId: "ODO-001", capturedAt: "2026-08-27T10:00", currentReading: 4279,
      dieselAccumulatedGallons: 14999, dailyMwAccumulated: 12.3, dailyMvarAccumulated: 3.1,
    });
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) expect(result.value.message).toContain("no pueden ser menores");
  });
});
