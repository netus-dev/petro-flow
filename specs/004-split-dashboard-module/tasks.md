# Tasks: Navegación Modular y Seguridad Centralizada

**Feature**: `004-split-dashboard-module`
**Branch**: `004-split-dashboard-module`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Generated**: 2026-07-19

---

## Phase 1: Setup (Infraestructura Compartida)

**Purpose**: Crear el cliente Supabase para Edge Runtime y el componente de carga visual, pre-requisitos compartidos por múltiples user stories.

- [ ] T001 [P] Create Supabase middleware client factory in `src/core/lib/supabase/middleware.ts` using `createServerClient` from `@supabase/ssr`, wiring request/response cookies for Edge Runtime
- [ ] T002 [P] Create `AppLoader` atom in `src/core/presentation/components/ui/app-loader.tsx` — full-screen centered loader displaying the PetroFlow logo with a CSS pulse animation, consistent with the dark theme

**Checkpoint**: Los dos artefactos de infraestructura compartida están disponibles para ser usados por el middleware y el layout.

---

## Phase 2: Foundational (Prerequisitos Bloqueantes)

**Purpose**: El middleware de autenticación es la pieza central que habilita la seguridad de todas las rutas. Sin este paso ninguna user story puede considerarse completa.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 Create `middleware.ts` at the project root implementing the full auth flow: validate session with `createServerClient` from `src/core/lib/supabase/middleware.ts`, redirect unauthenticated or expired-session users (`user === null`) to `/auth/login?redirectTo={pathname}`, redirect authenticated users away from `/auth/*` to `/dashboard`, and refresh session cookies on every pass-through request
- [ ] T004 Configure the middleware `matcher` in `middleware.ts` to exclude static assets (`_next/static`, `_next/image`, `favicon.ico`, `.svg`, `.png`, `.jpg`, `.ico`) and apply to all other routes

**Checkpoint**: Abrir el navegador sin sesión e intentar acceder a `/dashboard` debe redirigir a `/auth/login?redirectTo=/dashboard`.

---

## Phase 3: User Story 4 — Protección Automática de Acceso (Priority: P1) 🎯 MVP

**Goal**: Garantizar que cualquier acceso no autorizado sea bloqueado antes del render y que el flujo de login redirija al destino original.

**Independent Test**: Cerrar sesión y navegar a `/requisitions` → aterrizar en `/auth/login?redirectTo=/requisitions`. Iniciar sesión → aterrizar en `/requisitions`, no en `/dashboard`.

### Implementation for User Story 4

- [ ] T005 [US4] Update `src/features/auth/presentation/components/login-form.tsx`: read `searchParams.get('redirectTo')` from the page URL, validate it is a relative path starting with `/` and not pointing to `/auth/*`; after a successful login, call `router.push(redirectTo ?? '/dashboard')` instead of the hardcoded `/dashboard`
- [ ] T006 [US4] Update `app/auth/login/page.tsx` to accept and pass `searchParams` down to `LoginForm` as a prop so the redirect param is accessible from the Server Component page

**Checkpoint**: Flujo completo acceso denegado → login → redirección al destino original funciona. User Story 4 verificable independientemente.

---

## Phase 4: User Story 1 — Acceso Directo a un Módulo Operativo (Priority: P1) 🎯

**Goal**: Mover todos los módulos operativos a URLs de primer level bajo un Route Group `(authenticated)` que comparte el layout de Sidebar + Navbar.

**Independent Test**: Navegar directamente a `/requisitions` (con sesión activa) → muestra la pantalla de Requisiciones con Sidebar y Navbar activos, sin redirigir ni generar 404.

### Implementation for User Story 1

- [ ] T007 [US1] Create `app/(authenticated)/layout.tsx` by moving the full content of `app/dashboard/layout.tsx` into it — this becomes the shared layout wrapper (Sidebar + Navbar) for all authenticated modules; import and add `<Suspense fallback={<AppLoader />}>` wrapping children using the atom from T002
- [ ] T008 [P] [US1] Move `app/dashboard/trazabilidad/` directory to `app/(authenticated)/trazabilidad/` (preserving all nested files)
- [ ] T009 [P] [US1] Move `app/dashboard/timesheet/` directory to `app/(authenticated)/timesheet/` (preserving all nested files)
- [ ] T010 [P] [US1] Move `app/dashboard/requisitions/` directory to `app/(authenticated)/requisitions/` (preserving all nested files)
- [ ] T011 [P] [US1] Move `app/dashboard/e-learning/` directory to `app/(authenticated)/e-learning/` (preserving all nested files)
- [ ] T012 [P] [US1] Move `app/dashboard/hour-meters/` directory to `app/(authenticated)/hour-meters/` (preserving all nested files)
- [ ] T013 [P] [US1] Move `app/dashboard/look-a-head/` directory to `app/(authenticated)/look-a-head/` (preserving all nested files)
- [ ] T014 [P] [US1] Move `app/dashboard/notificaciones/` directory to `app/(authenticated)/notificaciones/` (preserving all nested files)
- [ ] T015 [P] [US1] Move `app/dashboard/settings/` directory to `app/(authenticated)/settings/` (preserving all nested files)
- [ ] T016 [P] [US1] Move `app/dashboard/soporte/` directory to `app/(authenticated)/soporte/` (preserving all nested files)
- [ ] T017 [P] [US1] Move `app/dashboard/admin/` directory to `app/(authenticated)/admin/` (preserving all nested files)
- [ ] T018 [US1] Move `app/dashboard/page.tsx` to `app/(authenticated)/dashboard/page.tsx` — the Dashboard module becomes a sibling of the rest within the Route Group
- [ ] T019 [US1] Delete `app/dashboard/layout.tsx` and the now-empty `app/dashboard/` directory (⚠️ MUST execute AFTER T007 has copied layout.tsx to `app/(authenticated)/`)

**Checkpoint**: `app/dashboard/` no existe como carpeta de primer nivel. Todos los módulos están bajo `app/(authenticated)/`. Navegar a `/requisitions`, `/timesheet` y `/dashboard` funciona con el layout compartido.

---

## Phase 5: User Story 2 — Dashboard como Vista Analítica Exclusiva (Priority: P2)

**Goal**: Confirmar que `/dashboard` expone únicamente métricas y KPIs, y que el Sidebar muestra Dashboard como ítem al mismo nivel que los demás módulos.

**Independent Test**: Navegar a `/dashboard` → muestra la vista de métricas. El ítem "Dashboard" en la barra lateral está activo y a la misma jerarquía visual que Requisiciones, Timesheet, etc.

### Implementation for User Story 2

- [ ] T020 [P] [US2] Update `src/core/presentation/components/layout/app-sidebar.tsx`: change all module hrefs from `/dashboard/[module]` to `/[module]` (e.g. `/dashboard/timesheet` → `/timesheet`). The `/dashboard` href stays unchanged
- [ ] T021 [P] [US2] Update `src/features/dashboard/presentation/components/dashboard-module-cards.tsx`: change all card hrefs from `/dashboard/[module]` to `/[module]`
- [ ] T022 [P] [US2] Update `src/features/dashboard/presentation/components/dashboard-navbar.tsx`: change the notifications link from `/dashboard/notificaciones` to `/notificaciones`

**Checkpoint**: La barra lateral muestra Dashboard como elemento activo al mismo nivel visual que el resto de los módulos.

---

## Phase 6: User Story 3 — Experiencia de Navegación Consistente (Priority: P2)

**Goal**: Actualizar todos los enlaces de navegación interna dentro de los módulos para reflejar las nuevas URLs de primer nivel, eliminando cualquier referencia a rutas antiguas.

**Independent Test**: Crear una requisición y verificar que la redirección post-creación aterriza en `/requisitions/{id}`, no en `/dashboard/requisitions/{id}`.

### Implementation for User Story 3

- [ ] T023 [P] [US3] Update `src/features/requisitions/presentation/components/requisitions-list.tsx`: change hrefs from `/dashboard/requisitions/new` to `/requisitions/new` and from `/dashboard/requisitions/${req.id}` to `/requisitions/${req.id}`
- [ ] T024 [P] [US3] Update `src/features/requisitions/presentation/components/new-requisition-form.tsx`: change the post-creation redirect from `/dashboard/requisitions/${newReq.id}` to `/requisitions/${newReq.id}`
- [ ] T025 [P] [US3] Audit `src/features/trazabilidad/presentation/components/trazabilidad-content.tsx`: verify `/dashboard` reference to ensure it points correctly to the main Dashboard module and contains no legacy sub-module paths

**Checkpoint**: Flujo completo Sidebar → Requisiciones → New → Detail funciona sin ninguna URL con prefijo `/dashboard/`.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Tests unitarios obligatorios (Constitución VI), limpieza de código legado y validación final de compilación.

- [ ] T026 [P] Create unit tests for middleware logic in `src/core/lib/supabase/__tests__/middleware.test.ts`: cover — unauthenticated user + protected route (expect redirect to `/auth/login?redirectTo=...`), authenticated user + `/auth/login` (expect redirect to `/dashboard`), authenticated user + protected route (expect pass-through), expired session + protected route (expect redirect to login)
- [ ] T027 [P] Create unit tests for `LoginForm` redirect logic in `src/features/auth/presentation/components/__tests__/login-form.test.tsx`: cover — `redirectTo` present and valid (expect redirect there), `redirectTo` absent (expect `/dashboard`), `redirectTo` pointing to `/auth/login` (expect safety fallback to `/dashboard`)
- [ ] T028 Remove hardcoded credential values from `src/features/auth/presentation/components/login-form.tsx` lines 18–19: replace pre-filled `email` and `password` state with empty strings
- [ ] T029 Run `npx tsc --noEmit` at the project root to verify TypeScript compilation is clean after all route moves and file changes

**Checkpoint Final**: Todos los success criteria del spec son verificables. Build limpio. Tests pasando.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias. T001 y T002 paralelos.
- **Foundational (Phase 2)**: Depende de T001. Bloquea todo lo demás.
- **US4 (Phase 3)**: Depende de Phase 2. Puede correr en paralelo con Phase 4.
- **US1 (Phase 4)**: Depende de Phase 2. Puede correr en paralelo con Phase 3.
- **US2 (Phase 5)**: Depende de US1 — los módulos deben estar en su nueva ubicación antes de actualizar hrefs del sidebar.
- **US3 (Phase 6)**: Depende de US1. Puede correr en paralelo con US2.
- **Polish (Phase 7)**: Depende de todas las fases anteriores.

### Parallel Opportunities

- T001, T002 (Setup): Paralelos entre sí.
- T008–T017 (movimiento de módulos en US1): Todos paralelos entre sí.
- T020, T021, T022 (hrefs en US2): Paralelos entre sí.
- T023, T024, T025 (hrefs y audit en US3): Paralelos entre sí.
- T026, T027 (tests en Polish): Paralelos entre sí.

---

## Implementation Strategy

### MVP First (P1 — seguridad + rutas funcionales)

1. **Phase 1** → T001, T002 (infraestructura)
2. **Phase 2** → T003, T004 (middleware activo)
3. **Phase 3** → T005, T006 (login con redirect correcto)
4. **Phase 4** → T007–T019 (Route Group + módulos en primer nivel)
5. **STOP y VALIDAR**: SC-001 y SC-002 verificables. MVP entregable.

### Incremental Delivery

1. Setup + Middleware → Seguridad activa en todas las rutas
2. US4 + US1 → Módulos en primer nivel, login con redirect correcto **(MVP!)**
3. US2 → Dashboard con identidad de módulo analítico en el Sidebar
4. US3 → Links internos actualizados (cero 404 en flujos internos)
5. Polish → Tests + build limpio → Feature lista para merge

---

## Notes

- `[P]` = paralelizable (archivos distintos, sin dependencias incompletas)
- `[USn]` = traza la tarea a una user story específica del spec
- T008–T017 pueden realizarse con `mv` en terminal: `mv app/dashboard/trazabilidad app/(authenticated)/trazabilidad`
- Verificar que ningún `import` use rutas relativas que incluyan `/dashboard/` después de los movimientos (buscar con `grep -r "dashboard" app/`)
- Commit recomendado después de cada Phase completa
