import { describe, it, expect, beforeEach } from "vitest";
import { GetEquipmentKpiUseCase, RepositoryFailure } from "./kpi.usecases";
import { IEquipmentKpiRepository } from "../../domain/repositories/kpi.repository";
import { EquipmentKpi } from "../../domain/entities";
import { MockKpiDatasource } from "../../infrastructure/datasources/kpi.datasource";


// Mock repository implementation for unit tests
class MemoryKpiRepository implements IEquipmentKpiRepository {
  public kpis: Record<string, EquipmentKpi> = {};
  public shouldFail = false;
  public delayMs = 0;

  async getKpiByAssetId(assetId: string): Promise<EquipmentKpi | null> {
    if (this.shouldFail) {
      throw new Error("Simulated repository failure");
    }
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }
    return this.kpis[assetId] || null;
  }
}

describe("GetEquipmentKpiUseCase", () => {
  let repository: MemoryKpiRepository;
  let useCase: GetEquipmentKpiUseCase;

  const dummyKpi: EquipmentKpi = {
    assetId: "EQ-1",
    mtbf: 420,
    mttr: 3.5,
    availability: 99.03,
    reliability: {
      "1w": 67.03,
      "1m": 18.02,
      "3m": 0.61,
    },
  };

  beforeEach(() => {
    repository = new MemoryKpiRepository();
    useCase = new GetEquipmentKpiUseCase(repository);
  });

  it("happy path: retorna los KPIs cuando existen para el activo", async () => {
    repository.kpis = {
      "EQ-1": dummyKpi,
    };

    const result = await useCase.execute("EQ-1");

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const kpi = result.value;
      expect(kpi).not.toBeNull();
      expect(kpi?.assetId).toBe("EQ-1");
      expect(kpi?.mtbf).toBe(420);
      expect(kpi?.mttr).toBe(3.5);
      expect(kpi?.availability).toBe(99.03);
      expect(kpi?.reliability["1w"]).toBe(67.03);
    }
  });

  it("retorna null when the active does not have data", async () => {
    repository.kpis = {};

    const result = await useCase.execute("EQ-2");

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toBeNull();
    }
  });

  it("retorna Left con RepositoryFailure cuando ocurre un error en el repositorio", async () => {
    repository.shouldFail = true;

    const result = await useCase.execute("EQ-1");

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(RepositoryFailure);
      expect(result.value.message).toContain("Simulated repository failure");
    }
  });

  it("T021: verifica que la ejecucion resuelva dentro del limite de tiempo (< 2s)", async () => {
    repository.kpis = {
      "EQ-1": dummyKpi,
    };
    repository.delayMs = 150; // Latencia simulada típica

    const startTime = Date.now();
    const result = await useCase.execute("EQ-1");
    const duration = Date.now() - startTime;

    expect(result.isRight()).toBe(true);
    expect(duration).toBeLessThan(2000); // Límite de 2 segundos (2000 ms)
  });

  it("T019: verifica los cálculos matemáticos del MockKpiDatasource para ODO-001 y ODO-006", async () => {
    const datasource = new MockKpiDatasource();
    
    // ODO-001: activo con datos y fallas
    const kpi001 = await datasource.getKpiByAssetId("ODO-001");
    expect(kpi001).not.toBeNull();
    expect(kpi001?.mtbf).toBe(420);
    expect(kpi001?.mttr).toBe(3.5);
    expect(kpi001?.availability).toBe(99.03); // 100 * (1 - 7/720) = 99.0277... -> 99.03
    expect(kpi001?.reliability["1w"]).toBe(67.03); // e^(-168/420) * 100 = 67.032... -> 67.03
    expect(kpi001?.reliability["1m"]).toBe(18.01); // e^(-720/420) * 100 = 18.009... -> 18.01
    expect(kpi001?.reliability["3m"]).toBe(0.58);  // e^(-2160/420) * 100 = 0.584... -> 0.58

    // ODO-006: activo sin fallas (N/A)
    const kpi006 = await datasource.getKpiByAssetId("ODO-006");
    expect(kpi006).not.toBeNull();
    expect(kpi006?.mtbf).toBeNull();
    expect(kpi006?.mttr).toBeNull();
    expect(kpi006?.availability).toBe(100.00);
    expect(kpi006?.reliability["1w"]).toBeNull();
  });
});
