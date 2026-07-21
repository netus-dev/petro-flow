# Research: Navegación Modular y Seguridad Centralizada

**Feature**: 004-split-dashboard-module  
**Date**: 2026-07-19  
**Status**: Complete

---

## Decision 1: Estrategia de Autenticación — Middleware de Next.js

- **Decision**: Implementar la protección de rutas mediante `middleware.ts` en la raíz del proyecto, usando `createServerClient` de `@supabase/ssr` para validar la sesión en el servidor antes de que cualquier contenido renderice.
- **Rationale**: El proyecto ya tiene `@supabase/ssr` instalado y en uso (`src/core/lib/supabase/server.ts`). El middleware de Next.js es el único mecanismo que corre en Edge Runtime, antes del render, garantizando que **ningún fragmento de contenido protegido** sea enviado al cliente. Cumple con FR-004, FR-005, SC-002 y el principio II de la Constitución (Autenticación/Autorización gestionada por Supabase SSR).
- **Alternatives considered**:
  - *Protección en layouts (Server Components)*: No garantiza que el contenido no sea pre-renderizado antes de la verificación. Más tardío que el middleware.
  - *HOC client-side*: Viola el principio III de la Constitución (RSC First) y expone contenido antes del check (flash de contenido protegido).

## Decision 2: Agrupación de Rutas con Route Group `(authenticated)`

- **Decision**: Crear un Route Group `app/(authenticated)/` que contenga todos los módulos que comparten el layout de la aplicación (Sidebar + Navbar). El directorio `app/dashboard/` se reorganiza para que `dashboard/` sea un módulo hermano más dentro del Route Group, y los demás módulos se mueven desde `app/dashboard/[módulo]/` a `app/(authenticated)/[módulo]/`.
- **Rationale**: Los Route Groups de Next.js (`(nombre)`) no generan segmento de URL, lo que permite compartir un `layout.tsx` común sin acoplar la URL a la estructura de carpetas. Es la solución idiomática y recomendada por la documentación oficial de Next.js para exactamente este caso de uso.
- **Alternatives considered**:
  - *Mantener estructura plana sin Route Group*: Requeriría duplicar el layout de Sidebar/Navbar en cada módulo o usar un layout raíz que afectaría también a las rutas públicas (`/auth/login`).

## Decision 3: Preservación de URL de Destino Post-Login (Redirect URL Pattern)

- **Decision**: El middleware guarda la URL de destino original como query param en la URL de login (`/auth/login?redirectTo=/requisitions`). El `LoginForm` lee este parámetro tras un login exitoso y redirige allí en lugar de al hardcoded `/dashboard`.
- **Rationale**: Cumple con FR-010 y la clarificación Q1. Esta es la implementación estándar del patrón "redirect-to" usada por Supabase, Next.js Auth helpers y la mayoría de frameworks de autenticación modernos. No requiere estado global ni cookies adicionales.
- **Alternatives considered**:
  - *Guardar la URL en localStorage/sessionStorage*: Más complejo, vulnerable a cross-tab issues, y requiere lógica client-side extra.
  - *Guardar en cookie de sesión*: Más robusto para flujos OAuth, pero innecesariamente complejo para este caso (email/password únicamente).

## Decision 4: Loading State — Componente Centralizado de Carga

- **Decision**: Crear un componente `AppLoader` (átomo) en `src/core/presentation/components/ui/` que muestre el logo de PetroFlow con una animación de pulso sobre el fondo oscuro del tema. Este componente se usa como fallback en el `layout.tsx` de `(authenticated)` mediante React `<Suspense>`, y también en el middleware durante las redirecciones.
- **Rationale**: Cumple FR-009 y la clarificación Q3. Ser un átomo reutilizable respeta el Atomic Design de la Constitución (IV). Usar `<Suspense>` con fallback es la forma idiomática de Next.js RSC para mostrar estados de carga en Server Components.
- **Alternatives considered**:
  - *Spinner genérico*: Prohibido explícitamente por la Constitución (Anti-patrón: Spinners Genéricos).
  - *Skeleton de la interfaz completa*: Más complejo de implementar a nivel de layout sin conocer el contenido del módulo hijo.

## Decision 5: Actualización de Href en Navegación Interna

- **Decision**: Realizar un search-and-replace dirigido en `app-sidebar.tsx` y `dashboard-module-cards.tsx` para cambiar todos los hrefs de `/dashboard/[módulo]` a `/[módulo]`. El href de `/dashboard` permanece igual para el Dashboard Principal.
- **Rationale**: Los únicos archivos que contienen referencias hardcodeadas a las rutas son los identificados en el grep de investigación previa. El resto de la navegación (enlaces dentro de features individuales como `requisitions-list.tsx`) también deberá actualizarse como parte del refactor de sus rutas.
- **Alternatives considered**:
  - *Variable global de rutas*: Mejor práctica a largo plazo para evitar dispersión, pero fuera del alcance de esta feature según la Constitución.

---

## Inventario de Archivos con Referencias a Actualizar

| Archivo | Referencias actuales | Acción |
|---------|---------------------|--------|
| `src/core/presentation/components/layout/app-sidebar.tsx` | `/dashboard/trazabilidad`, `/dashboard/timesheet`, `/dashboard/requisitions`, `/dashboard/e-learning`, `/dashboard/hour-meters`, `/dashboard/look-a-head`, `/dashboard/settings`, `/dashboard/soporte`, `/dashboard/admin/catalogs` | Actualizar a rutas de primer nivel |
| `src/features/dashboard/presentation/components/dashboard-module-cards.tsx` | `/dashboard/trazabilidad`, `/dashboard/timesheet`, `/dashboard/e-learning`, `/dashboard/hour-meters`, `/dashboard/look-a-head` | Actualizar a rutas de primer nivel |
| `src/features/dashboard/presentation/components/dashboard-navbar.tsx` | `/dashboard/notificaciones` | Actualizar a `/notificaciones` |
| `src/features/requisitions/presentation/components/requisitions-list.tsx` | `/dashboard/requisitions/new`, `/dashboard/requisitions/${req.id}` | Actualizar a `/requisitions/new`, `/requisitions/${req.id}` |
| `src/features/requisitions/presentation/components/new-requisition-form.tsx` | `/dashboard/requisitions/${newReq.id}` | Actualizar a `/requisitions/${newReq.id}` |
| `src/features/trazabilidad/presentation/components/trazabilidad-content.tsx` | `/dashboard` | Mantener (es un enlace al Dashboard Principal) |
| `src/features/auth/presentation/components/login-form.tsx` | `router.push("/dashboard")` (hardcoded en dos lugares) | Actualizar para leer `redirectTo` del query param |

