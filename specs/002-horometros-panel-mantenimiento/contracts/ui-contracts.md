# UI Contracts: Panel de Plan de Mantenimiento

**Feature**: 002-horometros-panel-mantenimiento  
**Date**: 2026-06-23  
**Type**: Contrato de componentes UI (props interfaces)

> Este archivo documenta los contratos públicos (props) de los componentes del panel de mantenimiento, sirviendo como fuente de verdad para la integración entre componentes.

---

## `<MaintenancePanel />`

```typescript
// src/features/hour-meters/presentation/components/maintenance-panel/maintenance-panel.tsx

interface MaintenancePanelProps {
  /** Plan resuelto con umbral calculado y actividades fusionadas. null = estado vacío */
  resolvedPlan: ResolvedMaintenancePlan | null;
  /** Indica si el panel está cargando datos del use case */
  isLoading?: boolean;
  /** Callback para cerrar el panel (botón X) */
  onClose: () => void;
}
```

**Comportamiento**:
- Si `isLoading === true` → muestra skeleton
- Si `resolvedPlan === null && !isLoading` → muestra estado vacío (FR-010)
- Si `resolvedPlan` presente → muestra encabezado + lista de actividades

---

## `<ActivityList />`

```typescript
// src/features/hour-meters/presentation/components/maintenance-panel/activity-list.tsx

interface ActivityListProps {
  activities: MaintenanceActivity[];
  /** Permite scroll interno cuando la lista supera la altura del panel (FR-011) */
}
```

**Comportamiento**:
- Si `activities.length === 0` → muestra estado vacío diferenciado ("Plan definido sin tareas")
- Renderiza `<ActivityItem />` por cada actividad

---

## `<ActivityItem />`

```typescript
// src/features/hour-meters/presentation/components/maintenance-panel/activity-item.tsx

interface ActivityItemProps {
  activity: MaintenanceActivity;
}
```

**Comportamiento**: Muestra `name`, `category` (badge), `description`, y `estimatedDuration` (si está presente).

---

## `<HourMeterCard />`

```typescript
// src/features/hour-meters/presentation/components/hour-meter-card.tsx

interface HourMeterCardProps {
  record: EnhancedHourMeterRecord; // HourMeterRecord + campos calculados (remainingHours, progressValue, etc.)
  /** Si true, aplica estilo visual "activo/seleccionado" (FR-007) */
  isSelected: boolean;
  /** Callback al hacer clic en la tarjeta */
  onClick: (equipmentId: string) => void;
}
```

**Comportamiento**:
- `isSelected === true` → ring de borde extra, fondo con mayor opacidad
- Clic en tarjeta ya seleccionada → toggle (llama `onClick` y el padre cierra el panel)

---

## `useMaintenancePanel` hook

```typescript
// src/features/hour-meters/presentation/hooks/use-maintenance-panel.ts

interface UseMaintenancePanelReturn {
  selectedEquipmentId: string | null;
  resolvedPlan: ResolvedMaintenancePlan | null;
  isLoading: boolean;
  /** Abre o actualiza el panel con el activo dado; si es el mismo, lo cierra (toggle) */
  selectEquipment: (record: HourMeterRecord) => void;
  /** Cierra el panel explícitamente (botón X) */
  closePanel: () => void;
}
```

