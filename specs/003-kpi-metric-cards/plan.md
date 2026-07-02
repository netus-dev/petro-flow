# Implementation Plan: KPI Metric Cards en Panel de Mantenimiento

**Branch**: `003-kpi-metric-cards` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/003-kpi-metric-cards/spec.md`

---

## Summary

Agregar 4 tarjetas de KPI operacional (MTBF, MTTR, Disponibilidad, Confiabilidad) en el panel lateral de mantenimiento del módulo de horómetros. Las tarjetas se organizan en grilla 2×2, se actualizan reactivamente al activo seleccionado, e incluyen un Dropdown en la tarjeta de Confiabilidad para seleccionar el período de cálculo (1 semana / 1 mes / 3 meses).

La implementación sigue exactamente la cadena arquitectural Clean Architecture ya establecida en el módulo (`domain → infrastructure → application → presentation`) usando Mock Data, el patrón Either, y Skeleton Screens obligatorios.

---

## Technical Context

**Language/Version**: TypeScript 5.7  
**Primary Dependencies**: Next.js 16.1.6, React 19.2.4, Tailwind CSS 4.x, Radix UI, Zod 3.x  
**Storage**: Mock Data (estático, en `infrastructure/datasources/kpi.datasource.ts`)  
**Testing**: Vitest (según config existente del proyecto)  
**Target Platform**: Web — Next.js App Router, Client Components (`"use client"`)  
**Project Type**: Web application (Next.js)  
**Performance Goals**: Actualización de KPIs en < 2s al cambiar activo; < 1s al cambiar período Confiabilidad (simulado via `setTimeout` en mock)  
**Constraints**: No usar `supabase.from()` en UI. No hacer throws en Application. Usar skeleton, no spinners. Seguir Atomic Design.  
**Scale/Scope**: 12 activos en la demo; grilla 2×2 por panel lateral

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Justificación |
|---|---|---|
| Clean Architecture (Domain/Application/Infrastructure/Presentation) | ✅ PASS | Se crean capas separadas para KPIs |
| No `supabase.from()` en UI | ✅ PASS | Datos via Mock Datasource → Repository → UseCase → Hook |
| Patrón Either en Use Cases | ✅ PASS | `GetEquipmentKpiUseCase` retorna `Either<Failure, EquipmentKpi>` |
| Skeleton obligatorio para cargas async | ✅ PASS | `KpiMetricGrid` implementa estado skeleton en cada card |
| Atomic Design | ✅ PASS | `KpiMetricCard` (Molecule) + `KpiMetricGrid` (Organism) |
| JSDoc obligatorio | ✅ PASS | Todas las clases, interfaces y funciones tendrán JSDoc |
| Tests unitarios obligatorios | ✅ PASS | `kpi.usecases.test.ts` cubre happy path y Either failure |
| No Barrel files en raíces de UI | ✅ PASS | Importaciones directas por archivo |
| Datos mock no llegan a producción | ⚠️ ACKNOWLEDGED | Esta feature es explícitamente de fase UI-only. El mock está en infrastructure y es intercambiable. |

---

## Project Structure

### Documentation (this feature)

```text
specs/003-kpi-metric-cards/
├── plan.md              ← Este archivo
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/features/hour-meters/
│
├── domain/
│   └── entities.ts                        [MODIFY] Añadir EquipmentKpi, FailureEvent, ReliabilityPeriod
│
├── application/
│   └── usecases/
│       ├── kpi.usecases.ts                [NEW]
│       └── kpi.usecases.test.ts           [NEW]
│
├── infrastructure/
│   ├── datasources/
│   │   └── kpi.datasource.ts              [NEW]
│   └── repositories/
│       └── kpi.repository.ts              [NEW]
│
└── presentation/
    ├── hooks/
    │   └── use-equipment-kpi.ts           [NEW]
    └── components/
        └── maintenance-panel/
            ├── maintenance-panel.tsx      [MODIFY] Insertar KpiMetricGrid
            ├── kpi-metric-card.tsx        [NEW]
            └── kpi-metric-grid.tsx        [NEW]
```

**Structure Decision**: Single-project Next.js. Todo dentro del módulo `hour-meters` existente. Se extiende la estructura de capas sin crear nuevos módulos de feature.

---

## Phase 0: Research Output

Ver [`research.md`](./research.md) para las 8 decisiones de diseño documentadas con rationale y alternativas evaluadas.

**Resolución de NEEDS CLARIFICATION**: Ninguna (la spec estaba completa con 4 clarificaciones resueltas).

---

## Phase 1: Design & Contracts

### 1.1 Data Model

Ver [`data-model.md`](./data-model.md) para:
- Entidades `EquipmentKpi`, `FailureEvent`, `ReliabilityPeriod`
- Interfaz `IEquipmentKpiRepository`
- Estructura de directorios con archivos new/modify/existing
- Reglas de validación y transiciones de estado

### 1.2 Component Contracts (UI)

#### `KpiMetricCard` Props Contract

```typescript
interface KpiMetricCardProps {
  /** Etiqueta completa del KPI (ej: "MTBF") */
  label: string;
  /** Nombre completo del indicador */
  fullName: string;
  /** Valor numérico calculado, o null para estado N/A */
  value: number | null;
  /** Unidad de medida (ej: "hrs", "%") */
  unit: string;
  /** Si true, muestra skeleton en lugar del valor */
  isLoading: boolean;
  /** Dropdown de período (solo para Confiabilidad) */
  period?: ReliabilityPeriod;
  /** Callback de cambio de período (solo para Confiabilidad) */
  onPeriodChange?: (period: ReliabilityPeriod) => void;
}
```

#### `KpiMetricGrid` Props Contract

```typescript
interface KpiMetricGridProps {
  /** Datos KPI del activo seleccionado. null durante carga o sin datos. */
  kpi: EquipmentKpi | null;
  /** Si true, muestra skeleton en las 4 cards. */
  isLoading: boolean;
  /** Período seleccionado para Confiabilidad. */
  reliabilityPeriod: ReliabilityPeriod;
  /** Callback para cambio de período de Confiabilidad. */
  onReliabilityPeriodChange: (period: ReliabilityPeriod) => void;
}
```

#### `useEquipmentKpi` Hook Contract

```typescript
interface UseEquipmentKpiReturn {
  /** KPIs del activo actualmente seleccionado. */
  kpi: EquipmentKpi | null;
  /** Indica si los KPIs están cargando. */
  isLoading: boolean;
  /** Período activo para el cálculo de Confiabilidad. */
  reliabilityPeriod: ReliabilityPeriod;
  /** Actualiza el período de Confiabilidad (persiste entre cambios de activo). */
  setReliabilityPeriod: (period: ReliabilityPeriod) => void;
}
```

### 1.3 Flujo de Datos Completo

```text
HourMeterCard (click)
    │
    └─► useMaintenancePanel.selectEquipment(record)
              │
              ├─► [existente] GetNextMaintenancePlanUseCase → MaintenancePanel
              │
              └─► [nuevo] useEquipmentKpi(assetId)
                          │
                          └─► GetEquipmentKpiUseCase.execute(assetId)
                                      │
                                      └─► KpiRepository.getKpiByAssetId(assetId)
                                                  │
                                                  └─► MockKpiDatasource.getByAssetId(assetId)
                                                              │
                                                              └─► EquipmentKpi (mock data)
                          │
                          └─► KpiMetricGrid (isLoading + kpi + period)
                                      │
                                      └─► KpiMetricCard × 4
```

### 1.4 Mock Data Structure (extracto representativo)

```typescript
// kpi.datasource.ts — estructura de datos mock por assetId
{
  "ODO-001": {
    mtbf: 420,           // horas promedio entre fallas
    mttr: 3.5,           // horas promedio de reparación
    failureHoursMonth: 7, // horas en falla en el mes actual
    totalHoursMonth: 720  // horas totales del mes
    // Disponibilidad = 100 × (1 - 7/720) = 99.03%
    // Confiabilidad_1w  = e^(-168/420)  × 100 ≈ 67%
    // Confiabilidad_1m  = e^(-720/420)  × 100 ≈ 18%
    // Confiabilidad_3m  = e^(-2160/420) × 100 ≈ 0.6%
  },
  "ODO-006": {
    mtbf: null,   // sin fallas registradas → N/A
    mttr: null,
    failureHoursMonth: 0,
    totalHoursMonth: 720
  }
}
```

---

## Complexity Tracking

No hay violaciones de la constitución que requieran justificación. La única nota reconocida es la presencia de Mock Data, que es una decisión explícita de producto (fase UI-only) y no un anti-patrón inadvertido. El mock reside en `infrastructure/datasources/` y es intercambiable sin tocar `application` ni `presentation`.

---

## Verification Plan

### Automated Tests

```bash
# Ejecutar tests unitarios del módulo (ajustar según config existente):
pnpm test src/features/hour-meters/application/usecases/kpi.usecases.test.ts

# O todos los tests del módulo:
pnpm test src/features/hour-meters
```

**Cobertura requerida por constitución**:
- `GetEquipmentKpiUseCase.execute()` — happy path (activo con datos mock)
- `GetEquipmentKpiUseCase.execute()` — activo sin datos → `right(null)`
- `GetEquipmentKpiUseCase.execute()` — falla del repositorio → `left(RepositoryFailure)`
- Cálculos: MTBF, MTTR, Disponibilidad, Confiabilidad (valores numéricos exactos)

### Manual Verification

1. Abrir `http://localhost:3000/dashboard/hour-meters`
2. Hacer clic en la tarjeta de `ODO-001` → verificar que el panel abre con 4 KPI cards en grilla 2×2 posicionadas antes de "Próximo límite"
3. Cambiar al activo `ODO-002` → verificar que las 4 cards muestran skeleton y luego se actualizan con nuevos valores
4. Hacer clic en `ODO-006` (activo sin datos de falla) → verificar que MTBF y MTTR muestran "—" con etiqueta "Sin datos"
5. En la card de Confiabilidad, cambiar el Dropdown de "1 semana" a "1 mes" → verificar que el porcentaje se actualiza
6. Cambiar de activo con el período "1 mes" seleccionado → verificar que el Dropdown mantiene "1 mes"
7. En móvil (`< md`), verificar que la grilla colapsa a 1 columna
