# Data Model: Panel de Plan de Mantenimiento

**Feature**: 002-horometros-panel-mantenimiento  
**Date**: 2026-06-23  
**Phase**: 1 — Design & Contracts

---

## Entidades de Dominio

### Entidades Existentes (sin cambios)

#### `HourMeterRecord` _(ya en `domain/entities.ts`)_

```typescript
export interface HourMeterRecord {
  id: string;             // e.g. "ODO-001"
  platform: string;
  equipment: string;      // Nombre del activo
  currentReading: number; // Lectura actual en horas
  previousReading: number;
  unit: string;           // "hrs"
  lastUpdated: string;    // ISO date
  maxThreshold: number;   // Umbral de alerta general
  status: HourMeterStatus;
}
```

---

### Nuevas Entidades

#### `MaintenancePlan`

```typescript
/**
 * Plan de mantenimiento para un activo físico.
 * Puede ser cíclico (intervalHours) o de umbral fijo puntual (fixedThresholdHours).
 * Al menos uno de los dos campos opcionales debe estar presente.
 */
export interface MaintenancePlan {
  id: string;
  equipmentId: string;          // Referencia a HourMeterRecord.id
  /** Intervalo cíclico en horas (e.g. 500 → cada 500h). Opcional si fixedThresholdHours está presente. */
  intervalHours?: number;
  /** Umbral fijo puntual en horas (e.g. 10000 → revisión mayor única). Opcional si intervalHours está presente. */
  fixedThresholdHours?: number;
  activities: MaintenanceActivity[];
}
```

**Regla de negocio**: `intervalHours` XOR `fixedThresholdHours` debe estar definido (o ambos si el plan representa una actividad que coincide con ambos criterios, aunque en v1 se separan en planes distintos).

**Cálculo del próximo umbral**:
- Si `intervalHours`: `nextThreshold = Math.ceil((currentReading + 1) / intervalHours) * intervalHours`
- Si `fixedThresholdHours` y `fixedThresholdHours > currentReading`: `nextThreshold = fixedThresholdHours`
- Si `fixedThresholdHours <= currentReading`: plan vencido, se omite

#### `MaintenanceActivity`

```typescript
/**
 * Actividad individual dentro de un plan de mantenimiento.
 * Representa una tarea concreta a realizar (e.g. "Cambio de aceite").
 */
export interface MaintenanceActivity {
  id: string;
  name: string;                    // e.g. "Cambio de aceite"
  description: string;             // Descripción detallada
  estimatedDuration?: string;      // e.g. "2h", "30min" — opcional
  category: MaintenanceCategory;   // Enum de categoría
}

export type MaintenanceCategory =
  | "lubricacion"
  | "inspeccion"
  | "sustitucion"
  | "calibracion"
  | "limpieza"
  | "otro";
```

#### `ResolvedMaintenancePlan`

```typescript
/**
 * Resultado del cálculo del próximo plan de mantenimiento.
 * Devuelto por GetNextMaintenancePlanUseCase.
 * Contiene el umbral calculado y la lista fusionada de actividades.
 */
export interface ResolvedMaintenancePlan {
  equipmentId: string;
  equipmentName: string;
  currentReading: number;
  nextThresholdHours: number;           // El umbral calculado más próximo
  activities: MaintenanceActivity[];    // Lista fusionada de todas las coincidencias
  planType: 'cyclic' | 'fixed' | 'merged'; // Para UI informativa (badge)
}
```

---

## Interface de Repositorio

```typescript
// src/features/hour-meters/domain/repositories/maintenance.repository.ts

export interface IMaintenancePlanRepository {
  /** Obtiene todos los planes de mantenimiento para un activo dado */
  getPlansByEquipmentId(equipmentId: string): Promise<MaintenancePlan[]>;
}
```

---

## Use Case

```typescript
// src/features/hour-meters/application/usecases/maintenance.usecases.ts

/**
 * Calcula el próximo umbral de mantenimiento para un activo y
 * devuelve la lista fusionada de actividades correspondientes.
 * Maneja tanto planes cíclicos (intervalHours) como fijos (fixedThresholdHours).
 */
export class GetNextMaintenancePlanUseCase {
  constructor(private repository: IMaintenancePlanRepository) {}

  async execute(
    equipmentId: string,
    equipmentName: string,
    currentReading: number
  ): Promise<ResolvedMaintenancePlan | null>
}
```

**Algoritmo interno**:
1. `plans = await repository.getPlansByEquipmentId(equipmentId)`
2. Si `plans.length === 0` → retornar `null`
3. Para cada plan calcular su `nextThreshold` (cíclico o fijo; omitir fijos vencidos)
4. `minThreshold = Math.min(...nextThresholds)`
5. `matching = plans.filter(p => getNext(p, currentReading) === minThreshold)`
6. `activities = matching.flatMap(p => p.activities)` (sin deduplicar por diseño)
7. `planType = matching.length > 1 ? 'merged' : matching[0].intervalHours ? 'cyclic' : 'fixed'`
8. Retornar `ResolvedMaintenancePlan`

---

## Relaciones entre Entidades

```
HourMeterRecord (1) ──────── (N) MaintenancePlan
                                         │
                                         │ (N) activities
                                         ▼
                               MaintenanceActivity
                                         
HourMeterRecord + [MaintenancePlan] ──► ResolvedMaintenancePlan
                    (use case)
```

---

## Validaciones y Restricciones

| Campo | Regla |
|---|---|
| `MaintenancePlan.equipmentId` | Debe corresponder a un `HourMeterRecord.id` existente |
| `MaintenancePlan.intervalHours` | Si presente: entero positivo > 0 |
| `MaintenancePlan.fixedThresholdHours` | Si presente: entero positivo > 0 |
| Al menos uno de los dos | `intervalHours` o `fixedThresholdHours` debe estar definido |
| `MaintenanceActivity.name` | String no vacío |
| `MaintenanceActivity.category` | Valor del enum `MaintenanceCategory` |
| `ResolvedMaintenancePlan.nextThresholdHours` | Siempre > `currentReading` |

---

## Estado de UI (no persistido)

```typescript
// En useMaintenancePanel hook — estado local React
interface MaintenancePanelState {
  selectedEquipmentId: string | null;  // null = panel cerrado
  resolvedPlan: ResolvedMaintenancePlan | null;
  isLoading: boolean;
}
```

