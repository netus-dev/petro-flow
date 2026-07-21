# Data Model: Navegación Modular y Seguridad Centralizada

**Feature**: 004-split-dashboard-module  
**Date**: 2026-07-19

---

Esta feature es primariamente estructural (reorganización de rutas y layout). No introduce nuevas entidades de datos ni modifica el esquema de base de datos. Se documenta a continuación el modelo de las entidades de navegación/sesión que esta feature manipula.

## Entities

### SessionContext (Edge Runtime — Middleware)

Objeto de sesión validado por Supabase SSR en el middleware. Solo lectura desde el middleware.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `user` | `User \| null` | Usuario autenticado de Supabase. `null` si no hay sesión activa o expirada. |
| `user.id` | `string` | UUID del usuario en Supabase Auth. |
| `user.email` | `string` | Email del usuario autenticado. |

### RedirectIntent (Query Parameter)

Parámetro de URL que preserva la intención de navegación del usuario antes de ser enviado al login.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `redirectTo` | `string` | Pathname URL-encoded de la ruta protegida que el usuario intentaba visitar (e.g., `/requisitions`). Solo se incluye si el acceso fue rechazado desde una ruta protegida. Ausente en navegaciones directas al login. |

**Validación**: El valor de `redirectTo` debe ser un pathname relativo y válido (comenzar con `/`). No puede apuntar a rutas públicas ni rutas del sistema (`/_next`). En el `LoginForm`, si `redirectTo` está ausente o es inválido, se redirige a `/dashboard`.

### RouteConfig (Conceptual — Middleware matcher)

Define qué rutas activan el middleware de autenticación.

| Patrón | Tipo | Descripción |
|--------|------|-------------|
| `/((?!_next/static\|_next/image\|favicon.ico\|.*\\.svg\|.*\\.png\|.*\\.jpg\|.*\\.ico).*)`  | Regex | Todas las rutas excepto assets estáticos. |

**Rutas Públicas**: `/auth/login`, `/auth/register` (si aplica). El middleware permite el paso sin validación de sesión.  
**Rutas Protegidas**: Todas las demás rutas bajo el Route Group `(authenticated)`.

---

## State Transitions (Flujo de Autenticación del Middleware)

```
Request entrante
       │
       ▼
┌─────────────────────────────┐
│  ¿Es una ruta de asset?     │──── Sí ──▶ PASS (sin procesar)
└─────────────────────────────┘
       │ No
       ▼
┌─────────────────────────────┐
│  getUser() de Supabase SSR  │
└─────────────────────────────┘
       │
       ├──── user === null ──▶ ¿Es ruta pública (/auth/*)?
       │                              │
       │                              ├── Sí ──▶ PASS
       │                              └── No ──▶ REDIRECT /auth/login?redirectTo={pathname}
       │
       └──── user !== null ──▶ ¿Es ruta pública (/auth/*)?
                                       │
                                       ├── Sí ──▶ REDIRECT /dashboard
                                       └── No ──▶ PASS (refresh cookies y continuar)
```

