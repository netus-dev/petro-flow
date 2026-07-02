# Data Model: KPI Metric Cards en Panel de Mantenimiento

**Feature**: 003-kpi-metric-cards  
**Branch**: `003-kpi-metric-cards`  
**Phase**: Phase 1 — Design & Contracts

---

## Entidades del Dominio

### `EquipmentKpi`

Representa el conjunto de indicadores de confiabilidad y mantenimiento calculados para un activo específico.

```typescript
/**
 * Período de tiempo sobre el cual se evalúa la confiabilidad del activo.
 */
export type ReliabilityPeriod = "1w" | "1m" | "3m";

/**
 * Mapa de horas para cada período de confiabilidad soportado.
 */
export const RELIABILITY_PERIOD_HOURS: Record<ReliabilityPeriod, number> = {
  "1w": 168,    // 7 días × 24h
  "1m": 720,    // 30 días × 24h
  "3m": 2160,   // 90 días × 24h
};

/**
 * Etiquetas para mostrar en el Dropdown de período de confiabilidad.
 */
export const RELIABILITY_PERIOD_LABELS: Record<ReliabilityPeriod, string> = {
  "1w": "1 semana",
  "1m": "1 mes",
  "3m": "3 meses",
};

/**
 * Datos de KPI calculados para un activo. Todos los valores son el
 * resultado de cálculos sobre el historial de fallas del equipo.
 */
export interface EquipmentKpi {
  /** Identificador del activo al que pertenecen los KPIs. */
  assetId: string;
  /**
   * Mean Time Between Failures en horas.
   * null si el activo no tiene historial de fallas suficiente.
   */
  mtbf: number | null;
  /**
   * Mean Time To Repair en horas.
   * null si el activo no tiene registros de reparación.
   */
  mttr: number | null;
  /**
   * Disponibilidad operacional en porcentaje [0–100].
   * Calculada como: 100 × (1 − Horas_Falla_mes / Horas_Totales_mes).
   * null si no hay datos del mes en curso.
   */
  availability: number | null;
  /**
   * Mapa de confiabilidad calculada por período.
   * Fórmula: R(t) = e^(-t/MTBF) × 100, donde t en horas según el período.
   * null para un período si MTBF es null o no hay datos suficientes.
   */
  reliability: Record<ReliabilityPeriod, number | null>;
}
```

### `FailureEvent` (fuente para cálculos)

Representa un evento de falla histórico. Es la entrada del datasource mock para derivar MTBF y MTTR.

```typescript
/**
 * Evento histórico de falla de un activo.
 * Fuente primaria para el cálculo de MTBF, MTTR y Disponibilidad.
 */
export interface FailureEvent {
  /** Identificador único del evento de falla. */
  id: string;
  /** Identificador del activo afectado. */
  assetId: string;
  /** Timestamp ISO 8601 de inicio de la falla. */
  failureStart: string;
  /** Timestamp ISO 8601 de fin de reparación. */
  repairEnd: string;
  /** Duración total de la reparación (MTTR contribution) en horas. */
  repairHours: number;
}
```

---

## Interfaz del Repositorio (Domain)

```typescript
/**
 * Contrato que debe implementar cualquier repositorio de KPIs de activos.
 * Permite intercambiar MockKpiRepository por SupabaseKpiRepository sin
 * modificar la capa de Application ni de Presentation.
 */
export interface IEquipmentKpiRepository {
  /**
   * Obtiene los KPIs calculados para un activo dado.
   * @param assetId Identificador único del activo.
   * @returns Promesa con los KPIs calculados, o null si no hay datos.
   */
  getKpiByAssetId(assetId: string): Promise<EquipmentKpi | null>;
}
```

---

## Estructura de Directorios (nueva)

```text
src/features/hour-meters/
├── domain/
│   └── entities.ts                        [MODIFY] Añadir EquipmentKpi, FailureEvent, ReliabilityPeriod
│
├── application/
│   └── usecases/
│       ├── maintenance.usecases.ts        [EXISTING — no cambiar]
│       ├── maintenance.usecases.test.ts   [EXISTING — no cambiar]
│       ├── kpi.usecases.ts                [NEW] GetEquipmentKpiUseCase
│       └── kpi.usecases.test.ts           [NEW] Tests unitarios del use case
│
├── infrastructure/
│   ├── datasources/
│   │   ├── maintenance.datasource.ts      [EXISTING — no cambiar]
│   │   └── kpi.datasource.ts              [NEW] MockKpiDatasource (datos mock por assetId)
│   └── repositories/
│       └── kpi.repository.ts              [NEW] KpiRepository (implementa IEquipmentKpiRepository)
│
└── presentation/
    ├── hooks/
    │   ├── use-hour-meters.ts             [EXISTING — no cambiar]
    │   ├── use-maintenance-panel.ts       [EXISTING — no cambiar]
    │   └── use-equipment-kpi.ts           [NEW] Hook reactivo que llama al use case
    │
    └── components/
        ├── hour-meter-card.tsx            [EXISTING — no cambiar]
        ├── hour-meters-content.tsx        [EXISTING — no cambiar]
        └── maintenance-panel/
            ├── maintenance-panel.tsx      [MODIFY] Insertar <KpiMetricGrid> tras el header
            ├── kpi-metric-card.tsx        [NEW] Molecule: card individual de KPI con Dropdown opcional
            ├── kpi-metric-grid.tsx        [NEW] Organism: grilla 2×2 + estados skeleton/N/A
            ├── activity-item.tsx          [EXISTING — no cambiar]
            └── activity-list.tsx          [EXISTING — no cambiar]
```

---

## Reglas de Validación del Dominio

| Campo | Regla |
|---|---|
| `mtbf` | ≥ 0 o null. Null si número de fallas = 0 en el historial. |
| `mttr` | ≥ 0 o null. Null si no hay registros de reparación. |
| `availability` | Rango [0, 100] o null. Nunca negativo. |
| `reliability[period]` | Rango [0, 100] o null. Null si `mtbf` es null. |
| `assetId` | Debe coincidir con un `HourMeterRecord.id` existente. |

---

## Transiciones de Estado de las Cards

```text
assetId recibido
     │
     ▼
[SKELETON] ← isLoading = true
     │
     ▼
¿Hay datos en el Mock?
     │
     ├── Sí → [VALOR] mtbf/mttr/availability/reliability[period] con números
     │
     └── No → [N/A] Mostrar "—" con etiqueta "Sin datos"
```
