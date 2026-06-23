import { MaintenancePlan } from "../../domain/entities";

/**
 * Datasource de pruebas para simular planes de mantenimiento por activo.
 * Proporciona escenarios de prueba completos para validaciones de intervalos cíclicos, fijos y fusiones.
 */
export class MockMaintenanceDatasource {
  private static readonly mockPlans: Record<string, MaintenancePlan[]> = {
    "ODO-001": [
      {
        id: "plan-odo1-500",
        equipmentId: "ODO-001",
        intervalHours: 500,
        activities: [
          {
            id: "act-odo1-1",
            name: "Lubricación Básica (500h)",
            description: "Lubricar pasadores y cojinetes principales.",
            estimatedDuration: "1h",
            category: "lubricacion"
          }
        ]
      },
      {
        id: "plan-odo1-1000",
        equipmentId: "ODO-001",
        intervalHours: 1000,
        activities: [
          {
            id: "act-odo1-2",
            name: "Inspección Eléctrica (1000h)",
            description: "Medición de aislamiento de motor y cables.",
            estimatedDuration: "2h",
            category: "inspeccion"
          }
        ]
      }
    ],
    "ODO-002": [
      {
        id: "plan-odo2-500",
        equipmentId: "ODO-002",
        intervalHours: 500,
        activities: [
          {
            id: "act-odo2-1",
            name: "Limpieza Filtros Aire (500h)",
            description: "Limpieza con aire comprimido o cambio de filtros.",
            estimatedDuration: "30min",
            category: "limpieza"
          }
        ]
      },
      {
        id: "plan-odo2-fixed-2500",
        equipmentId: "ODO-002",
        fixedThresholdHours: 2500,
        activities: [
          {
            id: "act-odo2-2",
            name: "Revisión Mayor 2500h",
            description: "Ajuste de válvulas y calibración de motor.",
            estimatedDuration: "4h",
            category: "calibracion"
          }
        ]
      }
    ],
    "ODO-003": [
      {
        id: "plan-odo3-1000",
        equipmentId: "ODO-003",
        intervalHours: 1000,
        activities: [
          {
            id: "act-odo3-1",
            name: "Cambio Aceite Hidráulico",
            description: "Reemplazo de fluido hidráulico y filtros asociados.",
            estimatedDuration: "3h",
            category: "sustitucion"
          }
        ]
      },
      {
        id: "plan-odo3-fixed-5000",
        equipmentId: "ODO-003",
        fixedThresholdHours: 5000,
        activities: [
          {
            id: "act-odo3-2",
            name: "Calibración del Sistema (Vencido)",
            description: "Revisión de precisión a las 5000h (ya vencida).",
            estimatedDuration: "1h 30min",
            category: "calibracion"
          }
        ]
      }
    ],
    "ODO-004": [
      {
        id: "plan-odo4-1000",
        equipmentId: "ODO-004",
        intervalHours: 1000,
        activities: [
          {
            id: "act-odo4-1",
            name: "Inspección de Desgaste Mecánico",
            description: "Revisión de piezas móviles y poleas.",
            estimatedDuration: "1h",
            category: "inspeccion"
          }
        ]
      }
    ],
    "ODO-005": [
      {
        id: "plan-odo5-fixed-2000",
        equipmentId: "ODO-005",
        fixedThresholdHours: 2000,
        activities: [
          {
            id: "act-odo5-1",
            name: "Mantenimiento Mayor de Sistema Eléctrico",
            description: "Reemplazo preventivo de contactores principales.",
            estimatedDuration: "3h",
            category: "sustitucion"
          }
        ]
      }
    ],
    "ODO-006": []
  };

  /**
   * Obtiene de forma asíncrona la lista de planes de mantenimiento simulados para un activo.
   * @param equipmentId Identificador único del activo.
   * @returns Promesa con el array de planes de mantenimiento para el activo.
   */
  async getPlansByEquipmentId(equipmentId: string): Promise<MaintenancePlan[]> {
    // Simular latencia de red de 150ms para emular comportamiento real
    await new Promise((resolve) => setTimeout(resolve, 150));
    return MockMaintenanceDatasource.mockPlans[equipmentId] || [];
  }
}
