import { describe, it, expect, beforeEach } from "vitest";
import { GetNextMaintenancePlanUseCase } from "./maintenance.usecases";
import { IMaintenancePlanRepository } from "../../domain/repositories/maintenance.repository";
import { MaintenancePlan, MaintenanceActivity } from "../../domain/entities";

// Mock repository implementation for unit tests
class MemoryMaintenanceRepository implements IMaintenancePlanRepository {
  public plans: MaintenancePlan[] = [];

  async getPlansByEquipmentId(equipmentId: string): Promise<MaintenancePlan[]> {
    return this.plans.filter((p) => p.equipmentId === equipmentId);
  }
}

describe("GetNextMaintenancePlanUseCase", () => {
  let repository: MemoryMaintenanceRepository;
  let useCase: GetNextMaintenancePlanUseCase;

  const dummyActivity1: MaintenanceActivity = {
    id: "act-1",
    name: "Cambio Filtro",
    description: "Reemplazo de filtro de aceite",
    estimatedDuration: "1h",
    category: "sustitucion"
  };

  const dummyActivity2: MaintenanceActivity = {
    id: "act-2",
    name: "Inspección General",
    description: "Inspección visual de mangueras",
    estimatedDuration: "30min",
    category: "inspeccion"
  };

  beforeEach(() => {
    repository = new MemoryMaintenanceRepository();
    useCase = new GetNextMaintenancePlanUseCase(repository);
  });

  it("calcula el próximo múltiplo para un plan cíclico simple", async () => {
    repository.plans = [
      {
        id: "plan-1",
        equipmentId: "EQ-1",
        intervalHours: 500,
        activities: [dummyActivity1]
      }
    ];

    const result = await useCase.execute("EQ-1", "Equipo Test 1", 4280);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const plan = result.value;
      expect(plan).not.toBeNull();
      expect(plan?.nextThresholdHours).toBe(4500); // 4280 + 1 => Ceil(4281/500)*500 = 4500
      expect(plan?.planType).toBe("cyclic");
      expect(plan?.activities).toHaveLength(1);
      expect(plan?.activities[0].id).toBe("act-1");
    }
  });

  it("retorna el umbral fijo si es mayor a la lectura actual", async () => {
    repository.plans = [
      {
        id: "plan-2",
        equipmentId: "EQ-2",
        fixedThresholdHours: 2000,
        activities: [dummyActivity2]
      }
    ];

    const result = await useCase.execute("EQ-2", "Equipo Test 2", 1900);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const plan = result.value;
      expect(plan).not.toBeNull();
      expect(plan?.nextThresholdHours).toBe(2000);
      expect(plan?.planType).toBe("fixed");
      expect(plan?.activities).toHaveLength(1);
    }
  });

  it("omite el umbral fijo si la lectura actual lo supera (vencido)", async () => {
    repository.plans = [
      {
        id: "plan-3",
        equipmentId: "EQ-3",
        fixedThresholdHours: 5000,
        activities: [dummyActivity2]
      }
    ];

    // Lectura actual es 5800h (ya pasó las 5000h)
    const result = await useCase.execute("EQ-3", "Equipo Test 3", 5800);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const plan = result.value;
      expect(plan?.nextThresholdHours).toBe(6300);
      expect(plan?.activities).toHaveLength(1);
    }
  });

  it("selecciona el menor umbral cuando compiten cíclico y fijo", async () => {
    repository.plans = [
      {
        id: "plan-cyclic",
        equipmentId: "EQ-4",
        intervalHours: 500, // Próximo cíclico: 2500 (desde 2150)
        activities: [dummyActivity1]
      },
      {
        id: "plan-fixed",
        equipmentId: "EQ-4",
        fixedThresholdHours: 2300, // Fijo a las 2300 (vence antes)
        activities: [dummyActivity2]
      }
    ];

    const result = await useCase.execute("EQ-4", "Equipo Test 4", 2150);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const plan = result.value;
      expect(plan).not.toBeNull();
      expect(plan?.nextThresholdHours).toBe(2300); // 2300 < 2500
      expect(plan?.planType).toBe("fixed");
      expect(plan?.activities[0].id).toBe("act-2");
    }
  });

  it("fusiona actividades cuando dos planes coinciden en el mismo umbral", async () => {
    repository.plans = [
      {
        id: "plan-cyclic-500",
        equipmentId: "EQ-5",
        intervalHours: 500, // Próximo: 4500 (desde 4280)
        activities: [dummyActivity1]
      },
      {
        id: "plan-cyclic-1000",
        equipmentId: "EQ-5",
        intervalHours: 1000, // Próximo: 5000 (desde 4280)
        activities: [dummyActivity2]
      },
      {
        id: "plan-fixed-4500",
        equipmentId: "EQ-5",
        fixedThresholdHours: 4500, // Próximo: 4500 (coincide con el cíclico de 500)
        activities: [dummyActivity2] // tiene otra actividad
      }
    ];

    const result = await useCase.execute("EQ-5", "Equipo Test 5", 4280);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const plan = result.value;
      expect(plan).not.toBeNull();
      expect(plan?.nextThresholdHours).toBe(4500);
      expect(plan?.planType).toBe("merged");
      // Debe contener las actividades del cíclico de 500h Y del fijo de 4500h
      expect(plan?.activities).toHaveLength(2);
    }
  });

  it("crea un plan preventivo fallback cuando no hay planes para el activo", async () => {
    repository.plans = [];

    const result = await useCase.execute("EQ-6", "Equipo Test 6", 7200);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value?.nextThresholdHours).toBe(7700);
      expect(result.value?.activities[0].category).toBe("inspeccion");
    }
  });

  it("crea un plan preventivo cuando todos los planes fijos están vencidos", async () => {
    repository.plans = [
      {
        id: "plan-fixed-vencido",
        equipmentId: "EQ-7",
        fixedThresholdHours: 5000,
        activities: [dummyActivity1]
      }
    ];

    const result = await useCase.execute("EQ-7", "Equipo Test 7", 5800);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value?.nextThresholdHours).toBe(6300);
      expect(result.value?.activities).toHaveLength(1);
    }
  });
});
