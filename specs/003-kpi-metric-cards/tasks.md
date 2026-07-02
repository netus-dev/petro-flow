# Tasks: KPI Metric Cards en Panel de Mantenimiento

**Input**: Design documents from `specs/003-kpi-metric-cards/`  
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅  
**Branch**: `003-kpi-metric-cards`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend the domain and create the infrastructure skeleton for the KPI feature. These tasks are pure additions with no modifications to existing files — can be done safely in parallel.

- [ ] T001 [P] Add `EquipmentKpi`, `FailureEvent`, `ReliabilityPeriod`, `RELIABILITY_PERIOD_HOURS`, and `RELIABILITY_PERIOD_LABELS` types and constants to `src/features/hour-meters/domain/entities.ts`
- [ ] T002 [P] Add `IEquipmentKpiRepository` interface to `src/features/hour-meters/domain/repositories/kpi.repository.ts` (new file)
- [ ] T003 [P] Create `MockKpiDatasource` class with static mock data for all 12 assetIds (ODO-001 to ODO-012) — including one entry with null values for an asset with 0 registered failures (e.g., ODO-006) to demonstrate the N/A case. Include a lint guard/comment (e.g. `// TODO: Replace with SupabaseKpiDatasource before production`) to prevent mock data leakage — in `src/features/hour-meters/infrastructure/datasources/kpi.datasource.ts`

**Checkpoint**: Domain types defined and mock data available — Application layer can now begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Application and Infrastructure layers. Must complete before any Presentation work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Create `KpiRepository` class implementing `IEquipmentKpiRepository` using `MockKpiDatasource` in `src/features/hour-meters/infrastructure/repositories/kpi.repository.ts`
- [ ] T005 Create `GetEquipmentKpiUseCase` class with `execute(assetId: string): Promise<Either<Failure, EquipmentKpi | null>>` in `src/features/hour-meters/application/usecases/kpi.usecases.ts`
- [ ] T006 Write unit tests for `GetEquipmentKpiUseCase` covering: happy path (activo con datos), activo sin datos → `right(null)`, y falla del repositorio → `left(RepositoryFailure)` in `src/features/hour-meters/application/usecases/kpi.usecases.test.ts`
- [ ] T007 Create `useEquipmentKpi(assetId: string | null)` hook with `{ kpi, isLoading, reliabilityPeriod, setReliabilityPeriod }` in `src/features/hour-meters/presentation/hooks/use-equipment-kpi.ts` (Note: Full reactivity and race-condition guards will be established later in T011-T012)

**Checkpoint**: Foundation ready — US1, US2, and US3 can now proceed.

---

## Phase 3: User Story 1 — Visualización de KPIs del Activo Seleccionado (Priority: P1) 🎯 MVP

**Goal**: Mostrar las 4 tarjetas KPI (MTBF, MTTR, Disponibilidad, Confiabilidad) en grilla 2×2 en el panel lateral de mantenimiento, justo después de la línea divisora del header y antes del bloque "Próximo límite".

**Independent Test**: Abrir el panel de mantenimiento de ODO-001 → verificar que 4 tarjetas KPI aparecen en grilla 2×2 debajo del header y antes del bloque "Próximo límite", con valores numéricos reales y unidades correctas (hrs / %).

### Implementation for User Story 1

- [ ] T008 [P] [US1] Create `KpiMetricCard` molecule component with props `{ label, fullName, value, unit, isLoading, period?, onPeriodChange? }` — incluye estado skeleton `animate-pulse` y estado N/A `"—"` — in `src/features/hour-meters/presentation/components/maintenance-panel/kpi-metric-card.tsx`
- [ ] T009 [P] [US1] Create `KpiMetricGrid` organism component with props `{ kpi, isLoading, reliabilityPeriod, onReliabilityPeriodChange }` — grilla 2×2: Fila 1 MTBF/MTTR, Fila 2 Disponibilidad/Confiabilidad — incluyendo estado skeleton completo de las 4 cards — in `src/features/hour-meters/presentation/components/maintenance-panel/kpi-metric-grid.tsx`
- [ ] T010 [US1] Integrate `useEquipmentKpi` hook and render `<KpiMetricGrid>` inside `MaintenancePanel` (after header `<header>` with its `border-b` divider, before the "Próximo Límite" `bg-muted/40` block) in `src/features/hour-meters/presentation/components/maintenance-panel/maintenance-panel.tsx`

**Checkpoint**: User Story 1 independently functional. Abrir panel de cualquier activo → 4 tarjetas KPI visibles en posición correcta.

---

## Phase 4: User Story 2 — Reactividad al Cambio de Activo Seleccionado (Priority: P2)

**Goal**: Los KPIs se actualizan automáticamente al seleccionar un activo diferente, mostrando estado skeleton durante la carga y datos del nuevo activo al finalizar.

**Independent Test**: Seleccionar ODO-001 (verificar KPIs), luego seleccionar ODO-003 → las 4 cards muestran skeleton y luego valores distintos correspondientes a ODO-003. Seleccionar ODO-006 → MTBF y MTTR muestran "—" (sin datos).

### Implementation for User Story 2

- [ ] T011 [US2] Verify and adjust the `useEquipmentKpi` hook race-condition guard (using `useRef` or `useCallback` pattern matching `use-maintenance-panel.ts`) so that rapid asset switching cancels in-flight loads — update `src/features/hour-meters/presentation/hooks/use-equipment-kpi.ts` if needed
- [ ] T012 [US2] Pass `assetId` reactively from `MaintenancePanel` props (or from the resolved plan) into `useEquipmentKpi` so the hook re-fires on every asset change — update `src/features/hour-meters/presentation/components/maintenance-panel/maintenance-panel.tsx`
- [ ] T013 [US2] Revisar `KpiMetricGrid` skeleton: asegurar `animate-pulse` en 4 placeholders sin valores cero visibles — update `src/features/hour-meters/presentation/components/maintenance-panel/kpi-metric-grid.tsx`

**Checkpoint**: User Stories 1 AND 2 functional. Cambiar de activo → skeleton → datos actualizados en < 2s.

---

## Phase 5: User Story 3 — Selección de Período para la Confiabilidad (Priority: P3)

**Goal**: La tarjeta de Confiabilidad incluye un Dropdown con opciones "1 semana" / "1 mes" / "3 meses". Cambiar el período recalcula el porcentaje de confiabilidad para el activo activo. La selección persiste al cambiar de activo.

**Independent Test**: Abrir panel de ODO-001 → localizar tarjeta Confiabilidad → cambiar Dropdown de "1 semana" a "3 meses" → el porcentaje cambia. Cambiar a ODO-002 → el Dropdown mantiene "3 meses" y muestra la confiabilidad de ODO-002 en ese período.

### Implementation for User Story 3

- [ ] T014 [US3] Add Dropdown UI (using Radix UI `<Select>`) inside `KpiMetricCard` component, shown only when `period` prop is provided — options from `RELIABILITY_PERIOD_LABELS` — in `src/features/hour-meters/presentation/components/maintenance-panel/kpi-metric-card.tsx`
- [ ] T015 [US3] Pass `reliabilityPeriod` and `onReliabilityPeriodChange` from `useEquipmentKpi` through `KpiMetricGrid` props down to the Confiabilidad `KpiMetricCard` — update `src/features/hour-meters/presentation/components/maintenance-panel/kpi-metric-grid.tsx`
- [ ] T016 [US3] Ensure `reliabilityPeriod` state is stored in `useEquipmentKpi` independently of `assetId` so period selection is preserved across asset changes — verify behavior in `src/features/hour-meters/presentation/hooks/use-equipment-kpi.ts`

**Checkpoint**: All 3 user stories functional. Dropdown de período opera correctamente y persiste entre activos.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Responsive layout, visual refinement, and JSDoc documentation across all new files.

- [ ] T017 [P] Add responsive grid behavior to `KpiMetricGrid`: grilla 2×2 en pantallas `md` y superiores, grilla de 1 columna en pantallas `< md` — update `src/features/hour-meters/presentation/components/maintenance-panel/kpi-metric-grid.tsx`
- [ ] T018 [P] Add JSDoc comments to all new files: `entities.ts` (additions), `domain/repositories/kpi.repository.ts`, `kpi.datasource.ts`, `infrastructure/repositories/kpi.repository.ts`, `kpi.usecases.ts`, `use-equipment-kpi.ts`, `kpi-metric-card.tsx`, `kpi-metric-grid.tsx`
- [ ] T019 Validate mock data math: verify that computed Disponibilidad (100 × (1 - failureHours/totalHours)) and Confiabilidad (e^(-t/MTBF) × 100) values in `MockKpiDatasource` match expected output (e.g. for ODO-001: MTBF=420, MTTR=3.5h, Disponibilidad≈99.03%, Confiabilidad_1w≈67%) — update `src/features/hour-meters/infrastructure/datasources/kpi.datasource.ts` if corrections needed
- [ ] T020 Manual end-to-end walkthrough per Verification Plan in `specs/003-kpi-metric-cards/plan.md` (7 pasos: ODO-001, ODO-002, ODO-006, dropdown, persistencia, móvil)
- [ ] T021 Add timing test scenario to `src/features/hour-meters/application/usecases/kpi.usecases.test.ts` verifying that `GetEquipmentKpiUseCase.execute()` resolves within the simulated latency threshold (< 2s), consistent with SC-002

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001+T002+T003 completion
- **US1 (Phase 3)**: Depends on Foundational phase (T004–T007)
- **US2 (Phase 4)**: Depends on US1 (T008–T010) being complete
- **US3 (Phase 5)**: Depends on US1 (T008–T010) being complete; can run in parallel with US2
- **Polish (Phase 6)**: Depends on US1+US2+US3 completion

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 — no story dependencies
- **US2 (P2)**: Starts after US1 — extends reactivity of the `useEquipmentKpi` hook
- **US3 (P3)**: Starts after US1 — extends `KpiMetricCard` with Dropdown; independent from US2

### Within Each Phase

- T001, T002, T003 — parallelizable (different files)
- T008, T009 — parallelizable (different component files)
- T017, T018 — parallelizable (different concerns)

---

## Parallel Example: Phase 1 (Setup)

```bash
# These 3 tasks can run simultaneously:
Task T001: Add domain types to entities.ts
Task T002: Create IEquipmentKpiRepository interface
Task T003: Create MockKpiDatasource with static data
```

## Parallel Example: Phase 3 (US1)

```bash
# T008 and T009 can start simultaneously after Foundational:
Task T008: Create KpiMetricCard molecule
Task T009: Create KpiMetricGrid organism
# T010 starts once T008 + T009 are done:
Task T010: Integrate into MaintenancePanel
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T007)
3. Complete Phase 3: User Story 1 (T008–T010)
4. **STOP and VALIDATE**: Abrir panel → 4 tarjetas KPI visibles con datos de ODO-001
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → 4 tarjetas KPI estáticas visibles (**MVP demo**)
3. US2 → KPIs reactivos al activo seleccionado
4. US3 → Dropdown de período en Confiabilidad
5. Polish → Responsivo + JSDoc + validación final

---

## Notes

- [P] tasks = different files, no shared state dependencies
- [Story] label maps task to specific user story for traceability
- `useEquipmentKpi` debe seguir el mismo patrón de race-condition guard que `use-maintenance-panel.ts` (usando `useRef`)
- El `assetId` que recibe `useEquipmentKpi` debe provenir del panel, no del hook de mantenimiento — ambos hooks son independientes
- Todos los nuevos archivos deben incluir JSDoc obligatorio por constitución
- Ningún dato mock debe exponerse directamente en componentes UI — siempre vía el use case
