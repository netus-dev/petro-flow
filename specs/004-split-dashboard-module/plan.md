# Implementation Plan: Navegación Modular y Seguridad Centralizada

**Branch**: `004-split-dashboard-module` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/004-split-dashboard-module/spec.md`

---

## Summary

Reorganizar la estructura de rutas de PetroFlow para que el Dashboard sea un módulo analítico independiente y cada módulo operativo tenga su propia URL de primer nivel (e.g. `/requisitions`, `/timesheet`). Se implementa un middleware de Next.js que protege automáticamente todas las rutas usando Supabase SSR, y se preserva la URL de destino original para redirigir al usuario tras un login exitoso. Todos los módulos comparten el mismo layout de navegación (Sidebar + Navbar) mediante un Route Group `(authenticated)`.

---

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16.x, React 19.x, `@supabase/ssr` 0.8.0, Zustand 5.x, Tailwind CSS 4.x  
**Storage**: N/A (no cambios de esquema de base de datos)  
**Testing**: Unit tests con cobertura de Happy Path y flujos de error (Constitución VI)  
**Target Platform**: Web application (Next.js App Router — Edge + Server)  
**Performance Goals**: Redirección por middleware en < 1 segundo (SC-002)  
**Constraints**: Sin cambios a la lógica de negocio ni esquema de datos de ningún módulo. URLs antiguas `/dashboard/*` no tendrán soporte (clarificación registrada).  
**Scale/Scope**: 10 módulos operativos + 1 módulo Dashboard a reubicar en el Route Group.

---

## Constitution Check

| Principio | Estado | Notas |
|-----------|--------|-------|
| I. Estándares Tecnológicos (Next.js, Supabase SSR) | ✅ Pass | Middleware usa `@supabase/ssr`. Route Groups son idiomáticos de Next.js. |
| II. Seguridad — Supabase SSR + RLS | ✅ Pass | Validación en Edge Runtime antes de cualquier render. |
| III. RSC First — no Client-Side auth checks | ✅ Pass | El middleware corre antes del RSC. El loading state usa `<Suspense>`. |
| III. No Spinners Genéricos | ✅ Pass | El `AppLoader` es un componente de marca (logo + pulso). |
| IV. Clean Architecture — no DB en Presentación | ✅ Pass | El middleware accede a Supabase a través de `createServerClient`. No hay queries en UI. |
| IV. Atomic Design | ✅ Pass | `AppLoader` como átomo en `core/presentation/components/ui/`. |
| V. No datos hardcodeados | ✅ Pass | No se introduce ningún dato ficticio. |
| VI. Cobertura de Testing | ⚠️ Required | Tests unitarios para el middleware y la lógica del `LoginForm` son obligatorios. |
| VII. Anti-patrón: Client-Side fetch para auth | ✅ Pass | El check de sesión se elimina del cliente y se centraliza en el middleware. |

**Gate: PASS** — No hay violaciones que bloqueen el inicio de implementación.

---

## Project Structure

### Documentation (this feature)

```text
specs/004-split-dashboard-module/
├── plan.md              ← Este archivo
├── research.md          ← Decisiones de investigación
├── data-model.md        ← Modelo de entidades de sesión y flujo de auth
├── contracts/
│   └── routing-contract.md  ← URL map y behavior contract del middleware
└── tasks.md             ← (generado por /speckit-tasks)
```

### Source Code — Estructura resultante (después de la implementación)

```text
app/
├── (authenticated)/              ← [NEW] Route Group — no afecta URLs
│   ├── layout.tsx                ← [MOVED] Contenido del antiguo app/dashboard/layout.tsx
│   ├── dashboard/                ← [MOVED] Módulo Dashboard Principal
│   │   └── page.tsx
│   ├── trazabilidad/             ← [MOVED desde app/dashboard/trazabilidad/]
│   ├── timesheet/                ← [MOVED desde app/dashboard/timesheet/]
│   ├── requisitions/             ← [MOVED desde app/dashboard/requisitions/]
│   ├── e-learning/               ← [MOVED desde app/dashboard/e-learning/]
│   ├── hour-meters/              ← [MOVED desde app/dashboard/hour-meters/]
│   ├── look-a-head/              ← [MOVED desde app/dashboard/look-a-head/]
│   ├── notificaciones/           ← [MOVED desde app/dashboard/notificaciones/]
│   ├── settings/                 ← [MOVED desde app/dashboard/settings/]
│   ├── soporte/                  ← [MOVED desde app/dashboard/soporte/]
│   └── admin/                    ← [MOVED desde app/dashboard/admin/]
├── auth/
│   └── login/
│       └── page.tsx              ← Sin cambios de estructura
├── layout.tsx                    ← Sin cambios (Root Layout)
└── page.tsx                      ← Sin cambios (redirige a /auth/login)

middleware.ts                     ← [NEW] Raíz del proyecto

src/
└── core/
    ├── lib/
    │   └── supabase/
    │       └── middleware.ts     ← [NEW] Factory del cliente Supabase para middleware
    └── presentation/
        └── components/
            └── ui/
                └── app-loader.tsx ← [NEW] Átomo de carga (logo + pulso)
```

---

## Complexity Tracking

*Sin violaciones a la Constitución. No aplica.*

---

## Implementation Phases (para /speckit-tasks)

### Phase A — Middleware de Autenticación (P1, FR-004, FR-005, FR-006, FR-008, FR-009, FR-010)

1. Crear `src/core/lib/supabase/middleware.ts` — factory de `createServerClient` optimizado para middleware (manejo de cookies de request/response).
2. Crear `middleware.ts` en la raíz del proyecto con la lógica de validación de sesión y redirección.
3. Crear el átomo `src/core/presentation/components/ui/app-loader.tsx` (logo PetroFlow + animación de pulso).
4. Actualizar `src/features/auth/presentation/components/login-form.tsx` para leer el query param `redirectTo` y redirigir post-login a la URL original (validando que sea una ruta relativa válida y no pública).

### Phase B — Reorganización de Rutas y Route Group (P1, FR-001, FR-002, FR-003)

5. Crear `app/(authenticated)/layout.tsx` copiando el contenido actual de `app/dashboard/layout.tsx`.
6. Mover todas las carpetas de `app/dashboard/[módulo]/` a `app/(authenticated)/[módulo]/` (conservando `app/dashboard/` dentro del Route Group como `app/(authenticated)/dashboard/`).
7. Eliminar `app/dashboard/layout.tsx` (ya no necesario — reemplazado por el del Route Group).

### Phase C — Actualización de Navegación Interna (P2, FR-007)

8. Actualizar `src/core/presentation/components/layout/app-sidebar.tsx` — cambiar todos los hrefs de módulos a rutas de primer nivel.
9. Actualizar `src/features/dashboard/presentation/components/dashboard-module-cards.tsx` — cambiar hrefs de módulos.
10. Actualizar `src/features/dashboard/presentation/components/dashboard-navbar.tsx` — cambiar href de notificaciones.
11. Actualizar `src/features/requisitions/presentation/components/requisitions-list.tsx` — cambiar hrefs internos.
12. Actualizar `src/features/requisitions/presentation/components/new-requisition-form.tsx` — cambiar href de redirección post-creación.

### Phase D — Tests Unitarios (Constitución VI)

13. Crear tests unitarios para la lógica del middleware (casos: autenticado/no autenticado en ruta pública y protegida, sesión expirada).
14. Crear tests unitarios para la lógica de redirección del `LoginForm` (con y sin `redirectTo`, con `redirectTo` inválido).
