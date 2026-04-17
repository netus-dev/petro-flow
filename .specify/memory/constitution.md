<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0 
- List of modified principles:
  - [PROJECT_NAME] → Petro-Flow
  - New principles added: Estándares Tecnológicos, Requisitos de Seguridad, Rendimiento y Escalabilidad, Estándares de Código y Arquitectura, Cumplimiento y Gobernanza, Políticas de Testing, Lo que "No se debe hacer" (Anti-patrones)
- Added sections: None (mapped to Core Principles)
- Removed sections: Placeholder sections replaced.
- Templates requiring updates:
  - ✅ `.specify/templates/plan-template.md`: Checked, dynamically links to constitution.
  - ✅ `.specify/templates/spec-template.md`: Checked.
  - ✅ `.specify/templates/tasks-template.md`: Checked.
- Follow-up TODOs: Determine original Ratification Date (defaulted to today).
-->

# Petro-Flow Constitution

## Core Principles

### I. Estándares Tecnológicos
**Framework Principal**: Next.js 16.x, React 19.x, TypeScript 5.x, Tailwind CSS 4.x.
**Backend/BaaS**: Supabase (JS 2.98.0 y SSR 0.8.0).
**Gestión de Estado**: Zustand 5.x (como Singleton global) y RxJS para flujos asíncronos complejos o eventos.
**UI/Formularios**: Radix UI, React Hook Form, Zod.

### II. Requisitos de Seguridad
**Autenticación/Autorización**: Gestionada por Supabase SSR. Toda petición regulada por Row Level Security (RLS).
**Contexto de Compañía (Multi-tenant)**: Estricto control del `Company ID`. Los datos deben asociarse a la compañía actual del usuario en sesión.
**Ejecución Segura**: Validaciones críticas en Infrastructure, no desde la UI directamente.

### III. Rendimiento y Escalabilidad
**Next.js First (RSC)**: Prioridad máxima a los Server Components. Client Components solo para interactividad real.
**Data Fetching**: Casos de uso sin interacción activa del cliente deben pre-ejecutarse en el servidor.
**Perceived Performance**: Uso obligatorio de Skeleton Screens para cargas asíncronas de UI; no usar spinners genéricos para layouts fijos.
**Optimización**: Limitar el uso de "Barrel files" (`index.ts`) en la UI. Uso obligatorio de `<Image />`, `next/font` y `<Link />`.

### IV. Estándares de Código y Arquitectura
**Clean Architecture y Atomic Design**: Domain, Application, Infrastructure, Presentation. Componentes tipificados en Átomos, Moléculas, Organismos, etc.
**Data Mapper**: Todos los payloads (API a Domain) pasan por un Mapper en Infrastructure para desacoplar el frontend del backend.
**Patrón Either**: Los Use Cases no deben hacer throws crudos; devolver `Either<Failure, Success>`.
**Calidad**: Uso obligatorio de JSDoc en clases e interfaces, e Inyección de Dependencias.

### V. Cumplimiento y Gobernanza
**Integridad de Dashboards**: Omitir registros inactivos (`is_active: false`) por defecto, a menos que sea históricamente explícito.
**Validación Estricta**: No usar `.includes()` o regex en nombres; usar Enums o FKs concretas.
**Datos Ficticios**: Ningún dato "mockeado" o hardcodeado debe llegar a producción.

### VI. Políticas de Testing
**Cobertura Obligatoria**: Ninguna funcionalidad se considera terminada sin pruebas unitarias automatizadas. Debe probarse el "Happy Path" y las transiciones de error según el patrón Either.

### VII. Lo que "No se debe hacer" (Anti-patrones)
- **Consultas a DB desde la Presentación**: NUNCA usar `supabase.from()` en UI.
- **Throws en Application Layer**: Evitarlos. Usar Either.
- **Spinners Genéricos**: Prohibidos si la estructura es estática.
- **Abuso del Client-Side**: No forzar fetches en `useEffect` que puedan hacerse en el servidor.
- **Barrel Files en Raíces de UI**: No usarlos.
- **Hardcodeo de IDs**: Usar siempre el ID de la compañía que ha entrado al sistema.

## Governance

All PRs/reviews must verify compliance. Use `agents.md` rulebook for runtime development guidance.

**Version**: 1.1.0 | **Ratified**: 2026-04-17 | **Last Amended**: 2026-04-17
