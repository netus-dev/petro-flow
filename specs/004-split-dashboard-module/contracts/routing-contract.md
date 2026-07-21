# Routing Contract: Navegación Modular y Seguridad Centralizada

**Feature**: 004-split-dashboard-module  
**Date**: 2026-07-19

---

## URL Route Map (Before → After)

| Módulo | URL Anterior | URL Nueva | Tipo |
|--------|-------------|-----------|------|
| Dashboard Principal | `/dashboard` | `/dashboard` | Sin cambio |
| Trazabilidad | `/dashboard/trazabilidad` | `/trazabilidad` | Refactorizada |
| Timesheet | `/dashboard/timesheet` | `/timesheet` | Refactorizada |
| Requisiciones | `/dashboard/requisitions` | `/requisitions` | Refactorizada |
| E-Learning | `/dashboard/e-learning` | `/e-learning` | Refactorizada |
| Horómetros | `/dashboard/hour-meters` | `/hour-meters` | Refactorizada |
| Look-a-Head | `/dashboard/look-a-head` | `/look-a-head` | Refactorizada |
| Notificaciones | `/dashboard/notificaciones` | `/notificaciones` | Refactorizada |
| Configuración | `/dashboard/settings` | `/settings` | Refactorizada |
| Soporte | `/dashboard/soporte` | `/soporte` | Refactorizada |
| Administración | `/dashboard/admin` | `/admin` | Refactorizada |
| Login | `/auth/login` | `/auth/login` | Sin cambio (ruta pública) |

---

## Middleware Behavior Contract

### Input
- HTTP Request con cookies de sesión de Supabase.

### Output (según estado)

| Condición | Acción del Middleware | HTTP Status |
|-----------|----------------------|-------------|
| Usuario autenticado + ruta protegida | `NextResponse.next()` con cookies refrescadas | 200 (transparente) |
| Usuario NO autenticado + ruta protegida | `NextResponse.redirect('/auth/login?redirectTo={pathname}')` | 307 |
| Usuario autenticado + ruta pública `/auth/*` | `NextResponse.redirect('/dashboard')` | 307 |
| Usuario NO autenticado + ruta pública `/auth/*` | `NextResponse.next()` | 200 (transparente) |
| Cualquier usuario + asset estático | `NextResponse.next()` (sin procesar) | 200 (transparente) |

---

## Login Form Redirect Contract

### Input
- `searchParams.get('redirectTo')`: string o null (desde la URL del login).
- Resultado del `login()` use case: éxito o fallo.

### Output (tras login exitoso)

| Condición | Destino de Redirección |
|-----------|----------------------|
| `redirectTo` presente y válido (empieza con `/`, no es `/auth/*`) | `router.push(redirectTo)` |
| `redirectTo` ausente, inválido o apunta a ruta pública | `router.push('/dashboard')` |

