# Research: KPI Metric Cards en Panel de Mantenimiento

**Feature**: 003-kpi-metric-cards  
**Branch**: `003-kpi-metric-cards`  
**Phase**: Phase 0 — Research & Unknowns Resolution

---

## Decisions Tomadas

### D-001: Fuente de Datos de KPIs

- **Decision**: Mock Data integrado en el frontend (datasource estático mapeado por `assetId`)
- **Rationale**: Fase de desarrollo frontend en aislamiento. El patrón ya existe en `MockMaintenanceDatasource`. Permite entregar la feature completa con estados visuales (skeleton, N/A) sin dependencia del backend.
- **Alternatives considered**: Supabase RPC (descartado: no hay tablas de fallas configuradas), cálculo en cliente desde datos crudos (descartado: duplica lógica con demasiado ruido en el hook).

### D-002: Cálculo de Disponibilidad

- **Decision**: `Disponibilidad = 100% × (1 − Horas_Falla_mes / Horas_Totales_mes)`
- **Rationale**: Fórmula estándar de disponibilidad operacional en industria de mantenimiento predictivo (ISO 14224). Sin columna de downtime en la DB actual, se simulará con datos coherentes en el Mock.
- **Alternatives considered**: Horas operativas vs. horas esperadas según estándar de turno (descartado: requiere tabla de turnos/calendarios no disponible).

### D-003: Cálculo de Confiabilidad

- **Decision**: `R(t) = e^(-t/MTBF)` donde `t` es el período en horas (168h, 720h, 2160h según selección)
- **Rationale**: Modelo exponencial estándar (Weibull β=1) asumido para equipos en operación continua como los motores de generador del sistema. Fácilmente calculable en cliente sin dependencias externas.
- **Alternatives considered**: Modelo Weibull con β≠1 (descartado: requiere datos históricos extensos para estimar β).

### D-004: Arquitectura — Integración en la cadena de capas existente

- **Decision**: Nuevo dominio `EquipmentKpi` + datasource `MockKpiDatasource` + use case `GetEquipmentKpiUseCase` + hook `useEquipmentKpi` + componente `KpiMetricGrid`
- **Rationale**: Sigue exactamente el mismo patrón que `MaintenancePlan` → `MockMaintenanceDatasource` → `GetNextMaintenancePlanUseCase` → `useMaintenancePanel`. Garantiza coherencia arquitectural y facilita futuro reemplazo del Mock por Supabase sin tocar la presentación.
- **Alternatives considered**: Inline en `MaintenancePanel` (descartado: viola Clean Architecture y el principio de separación de concerns, haría el componente no testeble).

### D-005: Dropdown de Período de Confiabilidad

- **Decision**: Estado local en el componente `KpiMetricCard` de Confiabilidad con `useState`, sin elevar al store global de Zustand.
- **Rationale**: La selección del período es estado UI local del panel. No necesita ser compartido ni persistido entre sesiones. El hook `useEquipmentKpi` recalcula el valor al recibir la nueva selección vía prop.
- **Alternatives considered**: Zustand store (descartado: sobreespecificación para estado puramente local de UI sin efectos cross-feature).

### D-006: Posicionamiento en el Panel Lateral

- **Decision**: Insertar el `<KpiMetricGrid>` dentro de `maintenance-panel.tsx` justo después del `<header>` (que contiene la línea divisora `border-b`) y antes del bloque "Próximo límite" (`bg-muted/40`).
- **Rationale**: El `<header>` ya tiene `border-b border-border/40 pb-4 mb-4` que actúa como línea divisora. La inserción es aditiva: no requiere refactorización del componente existente, solo añadir el nuevo componente en la posición correcta del JSX.
- **Alternatives considered**: Nuevo sub-panel encima del header (descartado: contradice la especificación que indica "después de la línea divisora").

### D-007: Diseño del Componente KpiMetricCard (Atomic Design)

- **Decision**: `KpiMetricCard` como **Molecule** (etiqueta + valor + unidad + badge/dropdown opcional). `KpiMetricGrid` como **Organism** (grilla 2×2 de 4 cards + estado skeleton).
- **Rationale**: El diseño atómico está explícito en la constitución. Separa la card individual (reutilizable en futuro para otros paneles) del conjunto de cards (específico del panel de horómetros).
- **Alternatives considered**: Un único componente monolítico `KpiSection` (descartado: viola Atomic Design y reduce reusabilidad).

### D-008: Testing Strategy

- **Decision**: Tests unitarios para `GetEquipmentKpiUseCase` (happy path + Either failure), `MockKpiDatasource` (verificación de estructura de datos), y las fórmulas de cálculo (MTBF, MTTR, Disponibilidad, Confiabilidad).
- **Rationale**: La constitución exige cobertura de happy path y transiciones de error con patrón Either. Los cálculos matemáticos son determinísticos y fácilmente testeables.
- **Alternatives considered**: Tests de integración/E2E (diferidos: la feature es standalone en Mock, sin integración real que testear en esta fase).

---

## Tecnologías y Patrones Confirmados

| Aspecto | Elección | Justificación |
|---|---|---|
| Lenguaje | TypeScript 5.7 | Constitución |
| Framework | Next.js 16 + React 19 | Constitución |
| Styling | Tailwind CSS 4 | Constitución + componente existente |
| Estado UI | `useState` local | Período de Confiabilidad es estado local |
| Patrón Error | `Either<Failure, Success>` | Constitución |
| Mock Data | `MockKpiDatasource` (clase) | Patrón `MockMaintenanceDatasource` |
| Tests | Vitest / Jest (según config existente) | Constitución, obligatorio |
| Skeleton | `animate-pulse` + divs con `bg-muted` | Patrón `MaintenancePanel` existente |
