# Implementation Plan: Panel de Plan de Mantenimiento en Dashboard de Horómetros

**Branch**: `002-horometros-panel-mantenimiento` | **Date**: 2026-06-23 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-horometros-panel-mantenimiento/spec.md`

---

## Summary

Extender el Dashboard de Horómetros (módulo `hour-meters`) para que al hacer clic en una tarjeta de activo se despliegue un panel lateral de solo lectura a la derecha del grid, mostrando las actividades del próximo plan de mantenimiento calculado. El cálculo considera planes por **intervalo cíclico** (`intervalHours`) y planes por **umbral fijo puntual** (`fixedThresholdHours`), seleccionando el que vence primero. Cuando múltiples planes coinciden en el mismo umbral, sus actividades se fusionan en una lista unificada. Los datos de planes serán **mockeados en v1** siguiendo el patrón del hook `useHourMeters`. El panel es puramente informativo, cerrado por defecto, y solo se cierra de forma explícita (botón "X" o toggle de tarjeta).

---

## Technical Context

**Language/Version**: TypeScript 5.x  
**Framework**: Next.js 16.x / React 19.x  
**Styling**: Tailwind CSS 4.x + Radix UI  
**State Management**: Zustand 5.x (si el estado del panel seleccionado necesita ser global); React `useState` si permanece local al componente  
**UI Components**: Lucide React (iconos), Card/Badge de `@/src/core/presentation/components/ui/`  
**Storage**: N/A — datos mockeados en v1 (mismo patrón que `useHourMeters`)  
**Testing**: Vitest / Jest (siguiendo cobertura obligatoria de la constitución)  
**Target Platform**: Web (desktop ≥ 1024px, adaptación móvil como drawer/overlay)  
**Performance Goals**: Panel visible en < 300 ms tras clic (cálculo local, sin red en v1)  
**Constraints**: Sin llamadas a base de datos en v1; lógica de cálculo pura en Use Case  
**Scale/Scope**: 6 activos actuales; el panel puede escalar a más sin cambios estructurales

---

## Constitution Check

| Principio | Estado | Nota |
|---|---|---|
| **Clean Architecture**: domain → application → infrastructure → presentation | ✅ PASS | Se agregan todas las capas al módulo `hour-meters` |
| **Sin consultas DB en UI** | ✅ PASS | v1 es mock en infraestructura; nunca `supabase.from()` en componentes |
| **Skeleton Screens para async** | ✅ PASS | El panel debe mostrar skeleton mientras "carga" (simulado) |
| **RSC first (Next.js)** | ✅ PASS | El panel es Client Component solo por interactividad (useState para tarjeta seleccionada) |
| **JSDoc obligatorio** | ✅ PASS | Todas las entidades, repositorios y use cases llevarán JSDoc |
| **Either pattern en use cases** | ⚠️ DEFERIDO | La v1 es mock sin fallos de red; se documenta para cuando se conecte a Supabase |
| **Data Mapper** | ✅ PASS | El datasource mockeado actúa como mapper; estructura preparada para adaptación futura |
| **Pruebas unitarias obligatorias** | ✅ PASS | Cubierto en plan de testing (Use Case de cálculo + merge) |
| **Sin barrel files en UI roots** | ✅ PASS | Importaciones directas por archivo |
| **Atomic Design** | ✅ PASS | Panel → Organism; lista de actividades → Molecule; ítem actividad → Atom |

---

## Project Structure

### Documentation (this feature)

```text
specs/002-horometros-panel-mantenimiento/
├── plan.md              ← Este archivo
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/           ← Phase 1 output
└── tasks.md             ← Phase 2 (/speckit-tasks command)
```

### Source Code — Cambios en `hour-meters`

```text
src/features/hour-meters/
│
├── domain/
│   ├── entities.ts                          [MODIFY] Agregar MaintenancePlan, MaintenanceActivity
│   └── repositories/
│       └── maintenance.repository.ts        [NEW] Interface IMaintenancePlanRepository
│
├── application/
│   └── usecases/
│       └── maintenance.usecases.ts          [NEW] GetNextMaintenancePlanUseCase
│
├── infrastructure/
│   ├── datasources/
│   │   └── maintenance.datasource.ts        [NEW] Mock datasource con datos por activo
│   ├── repositories/
│   │   └── maintenance.repository.impl.ts   [NEW] Implementación concreta del repo
│   └── repository.ts                        [NEW] Singleton de MaintenancePlanRepository
│
└── presentation/
    ├── hooks/
    │   ├── use-hour-meters.ts               [EXISTING — sin cambios]
    │   └── use-maintenance-panel.ts         [NEW] Estado de selección + llamada al use case
    └── components/
        ├── hour-meters-content.tsx          [MODIFY] Agregar selección de tarjeta + panel lateral
        ├── maintenance-panel/               [NEW] Organism completo
        │   ├── maintenance-panel.tsx        [NEW] Contenedor del panel lateral
        │   ├── activity-list.tsx            [NEW] Molecule: lista de actividades
        │   └── activity-item.tsx            [NEW] Atom: ítem individual de actividad
        └── hour-meter-card.tsx              [NEW] Atom extraído: tarjeta de activo con estado "active"
```

**Structure Decision**: Single-feature layout dentro de `src/features/hour-meters/`, respetando la Clean Architecture del proyecto. No se crean nuevas features raíz; toda la funcionalidad es una extensión del módulo existente.

---

## Complexity Tracking

> Sin violaciones de constitución que justificar.

