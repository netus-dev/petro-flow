---
description: "Task list for Panel de Plan de Mantenimiento en Dashboard de Horómetros"
---

# Tasks: Panel de Plan de Mantenimiento en Dashboard de Horómetros

**Input**: Design documents from `/specs/002-horometros-panel-mantenimiento/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-contracts.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create missing module directories with placeholder files in `src/features/hour-meters/` (`domain/repositories`, `application/usecases`, `infrastructure/datasources`, `infrastructure/repositories`, `presentation/components/maintenance-panel`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Create Maintenance Domain Entities (`MaintenancePlan`, `MaintenanceActivity`, `ResolvedMaintenancePlan`, `MaintenanceCategory`) in `src/features/hour-meters/domain/entities.ts`
- [x] T002b [P] Define `Result<T, E>` / `Either` type to comply with Constitution §IV for Use Cases in `src/core/utils/either.ts`
- [x] T003 [P] Create Domain Repository Interface (`IMaintenancePlanRepository`) in `src/features/hour-meters/domain/repositories/maintenance.repository.ts`
- [x] T004 Create Mock Datasource with required test coverage scenarios in `src/features/hour-meters/infrastructure/datasources/maintenance.datasource.ts`
- [x] T005 Create Repository Implementation in `src/features/hour-meters/infrastructure/repositories/maintenance.repository.impl.ts`
- [x] T006 Create Repository Singleton in `src/features/hour-meters/infrastructure/repository.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Ver plan de mantenimiento al seleccionar un activo (Priority: P1) 🎯 MVP

**Goal**: Permitir la selección de una tarjeta para desplegar el panel lateral vacío o estado básico sin cálculo.

**Independent Test**: Al hacer clic en una tarjeta en el dashboard, el panel lateral se abre. Al hacer clic nuevamente o en la "X", se cierra. En pantallas chicas se ve como drawer.

### Implementation for User Story 1

- [x] T007 [P] [US1] Extract and create `HourMeterCard` component with `isSelected` logic in `src/features/hour-meters/presentation/components/hour-meter-card.tsx`
- [x] T008 [P] [US1] Create `MaintenancePanel` container component explicitly handling the skeleton loading state (isLoading) and empty state (resolvedPlan === null) (FR-010, Constitution §III) in `src/features/hour-meters/presentation/components/maintenance-panel/maintenance-panel.tsx`
- [x] T009 [US1] Implement `useMaintenancePanel` hook for local state management (selection toggle) in `src/features/hour-meters/presentation/hooks/use-maintenance-panel.ts`
- [x] T010 [US1] Integrate `HourMeterCard`, `MaintenancePanel` and `useMaintenancePanel` layout in `src/features/hour-meters/presentation/components/hour-meters-content.tsx`. Ensure content replaces without close/open animations (FR-009).
- [x] T010b [US1] Implement responsive layout on mobile (drawer behavior) (FR-012) in `src/features/hour-meters/presentation/components/hour-meters-content.tsx` (Requires T010. Implement via media queries/conditional rendering, do not duplicate integration logic)

**Checkpoint**: At this point, User Story 1 should be fully functional with UI interaction.

---

## Phase 4: User Story 2 - Calcular e identificar el plan de mantenimiento más próximo por intervalos y umbrales fijos (Priority: P2)

**Goal**: Calcular el próximo mantenimiento combinando iteraciones y umbrales fijos.

**Independent Test**: Ejecutar los unit tests del Use Case verificando la lógica de cálculo y fusión de planes.

### Tests for User Story 2

- [x] T011 [US2] Create unit tests for `GetNextMaintenancePlanUseCase` (7 scenarios from quickstart) in `src/features/hour-meters/application/usecases/maintenance.usecases.test.ts`

### Implementation for User Story 2

- [x] T012 [US2] Implement `GetNextMaintenancePlanUseCase` logic in `src/features/hour-meters/application/usecases/maintenance.usecases.ts`
- [x] T013 [US2] Update `useMaintenancePanel` hook to call the Use Case on selection and handle `isLoading`/`resolvedPlan` states in `src/features/hour-meters/presentation/hooks/use-maintenance-panel.ts` (extends hook from T009, initial state remains null)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. El panel ahora tiene datos reales calculados disponibles.

---

## Phase 5: User Story 3 - Visualizar el detalle de actividades del plan de mantenimiento (Priority: P2)

**Goal**: Renderizar de forma legible las actividades calculadas dentro del panel lateral.

**Independent Test**: El panel ahora lista las actividades correctamente o muestra un estado vacío claro ("Sin tareas").

### Implementation for User Story 3

- [x] T014 [P] [US3] Create `ActivityItem` component (Atom) in `src/features/hour-meters/presentation/components/maintenance-panel/activity-item.tsx`
- [x] T015 [US3] Create `ActivityList` component (Molecule) handling empty states/scroll in `src/features/hour-meters/presentation/components/maintenance-panel/activity-list.tsx`
- [x] T016 [US3] Update `MaintenancePanel` to render header details and the `ActivityList` using `resolvedPlan` data in `src/features/hour-meters/presentation/components/maintenance-panel/maintenance-panel.tsx`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T017 Code cleanup and ensure JSDoc exists in all new entities and use cases
- [x] T018 Implement feature flag or `NODE_ENV` guard for mock datasource to prevent it reaching production (Constitution §V) in `src/features/hour-meters/infrastructure/repository.ts`
- [x] T019 Validar manualmente que el panel lateral se abre en menos de 300ms tras hacer clic en una tarjeta (SC-001)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3+)**: Depend on Foundational phase
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 (Foundation)
- **User Story 2 (P2)**: Depends on US1 (to trigger the calculation via hook)
- **User Story 3 (P2)**: Depends on US2 (to get the `resolvedPlan` data for rendering)

### Parallel Opportunities

- Entities and Repo Interfaces in Foundational phase can be created in parallel.
- `HourMeterCard` and `MaintenancePanel` shell in US1 can be created in parallel.
- `ActivityItem` in US3 can be created independently of the `GetNextMaintenancePlanUseCase` in US2.

---

## Parallel Example: User Story 1

```bash
# Launch components for User Story 1 together:
Task: "Extract and create HourMeterCard component..."
Task: "Create MaintenancePanel container component explicitly handling the skeleton loading state..."
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify panel opens/closes without errors
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 → Test UI interaction → MVP!
3. Add User Story 2 → Test Use Case → Data layer works
4. Add User Story 3 → Test UI rendering → Full feature
