# Tasks: Light/Dark Mode Support

**Input**: Design documents from `/specs/001-theme-support/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Tests**: Optamos por pruebas de carga manuales para mitigar FOUC.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Install `next-themes` and `lucide-react` (for generic UI icons) into `package.json` dependencies
- [ ] T002 [P] Update `tailwind.config.ts` to support `darkMode: 'class'` directive

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Create `ThemeAlias` and `IThemeStore` types in `src/application/stores/theme.types.ts`
- [ ] T004 Create `useThemeStore` Zustand store mapped to LocalStorage via `persist` middleware in `src/application/stores/useThemeStore.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 3 - Detección del Dispositivo (Priority: P2)

**Goal**: El sitio se carga inicialmente respetando la configuración del sistema operativo del usuario.

**Independent Test**: Abrir el sitio sin historial; la UI adopta modo claro/oscuro según la variable OS.

### Implementation for User Story 3

- [ ] T005 [P] [US3] Create `ThemeProvider` component wrapping `next-themes` with `enableSystem={true}` and `defaultTheme="system"` inside `src/presentation/providers/ThemeProvider.tsx`
- [ ] T006 [US3] Update `src/app/layout.tsx` to inject `ThemeProvider` in its body content and add `suppressHydrationWarning` strictly to the root `<html>` tag

**Checkpoint**: El tema adopta automáticamente variables de CSS de acuerdo al SO.

---

## Phase 4: User Story 2 - Persistencia de Preferencia (Priority: P1)

**Goal**: La elección de tema se mantenga aunque cierre el navegador o lo recargue, ligando el estado general al store de Zustand persistentemente.

**Independent Test**: Carga fría de la página, sin destellos blancos previos al tema.

### Implementation for User Story 2

- [ ] T007 [P] [US2] Create sync hook or component `ThemeSync.tsx` inside `src/presentation/providers/ThemeSync.tsx` to listen to `onLoad/effect` of `useTheme` from `next-themes` and synchronize strictly downwards to `useThemeStore`.
- [ ] T008 [US2] Mount `<ThemeSync />` safely inside the DOM structure alongside `<ThemeProvider />`.

**Checkpoint**: At this point, the backend configurations are completely stored locally.

---

## Phase 5: User Story 1 - Cambio Manual de Tema (Priority: P1) 🎯 MVP

**Goal**: Permitir cambiar entre modo claro y oscuro visualmente de forma global mediante un interruptor manual.

**Independent Test**: Se puede probar haciendo clic en el interruptor, viendo un cambio imperceptible temporal de los tokens globales.

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create the `ThemeToggle` UI generic atom component (matching current design constraints and iconography) in `src/core/presentation/components/ui/ThemeToggle.tsx`
- [ ] T010 [US1] Replace the native HTML toggle in lines ~117-129 of `src/features/dashboard/presentation/components/dashboard-navbar.tsx` with the new React `<ThemeToggle />` component.

**Checkpoint**: All user stories should now be independently functional.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T011 [P] Validar el contrato de componentes en el Header o Panel principal para certificar relación de contraste WCAG > 4.5:1 en ambos temas.
- [ ] T012 Run performance build (`npm run build && npm start`) local verification covering hard reloads to verify zero FOUC frames matching SC-003.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup**: Can start immediately
- **Foundational**: Blocks stories until Zustand modeling operates
- **User Stories**: Must follow order: US3 (Provider) -> US2 (Sync) -> US1 (Controller UI).
- **Polish**: Final

### Parallel Opportunities

- The creation of `ThemeToggle` visual atom components can be operated in parallel with Zustand modelling immediately after setup dependencies are installed.
