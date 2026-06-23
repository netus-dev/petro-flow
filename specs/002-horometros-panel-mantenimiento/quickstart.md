# Quickstart: Panel de Plan de Mantenimiento

**Feature**: 002-horometros-panel-mantenimiento  
**Date**: 2026-06-23

---

## Para el desarrollador que implementará esta feature

### Contexto de alto nivel

Esta feature extiende el módulo `hour-meters` para agregar un panel lateral de mantenimiento al Dashboard de Horómetros. Al hacer clic en una tarjeta de activo, el panel aparece a la derecha del grid mostrando las actividades del próximo plan de mantenimiento calculado.

**No se requiere backend en v1** — todos los datos son mockeados.

---

## Orden de implementación (dependencias)

Seguir este orden estrictamente (capas de adentro hacia afuera):

```
1. Domain entities     → entities.ts (agregar tipos nuevos)
2. Domain repository   → maintenance.repository.ts (interface)
3. Application         → maintenance.usecases.ts (lógica de cálculo)
4. Infrastructure      → datasource + repository impl + singleton
5. Presentation hook   → use-maintenance-panel.ts
6. Presentation UI     → activity-item → activity-list → maintenance-panel → hour-meter-card
7. Integration         → modificar hour-meters-content.tsx
8. Tests               → use case unit tests
```

---

## Puntos clave de implementación

### 1. Algoritmo de cálculo (crítico)

```typescript
// Para un plan cíclico:
function calcCyclicNext(intervalHours: number, currentReading: number): number {
  return Math.ceil((currentReading + 1) / intervalHours) * intervalHours;
}

// Para un plan fijo:
function calcFixedNext(fixedThresholdHours: number, currentReading: number): number | null {
  return fixedThresholdHours > currentReading ? fixedThresholdHours : null; // null = vencido
}
```

### 2. Layout del panel — cambio en `hour-meters-content.tsx`

El `div` que actualmente es el grid de tarjetas (`flex-1 grid ...`) debe **envolverse** en un contenedor flex-row:

```tsx
{/* ANTES */}
<div className="flex-1 min-h-0 grid grid-cols-... gap-...">
  {cards}
</div>

{/* DESPUÉS */}
<div className="flex-1 min-h-0 flex flex-row gap-4 overflow-hidden">
  <div className={`min-h-0 grid grid-cols-... gap-... transition-all ${panelOpen ? 'flex-1' : 'w-full'}`}>
    {cards}
  </div>
  {panelOpen && (
    <MaintenancePanel
      resolvedPlan={resolvedPlan}
      isLoading={isLoading}
      onClose={closePanel}
    />
  )}
</div>
```

### 3. Estado de tarjeta seleccionada

El estado vive en `useMaintenancePanel`. El comportamiento toggle se implementa en `selectEquipment`:

```typescript
function selectEquipment(record: HourMeterRecord) {
  if (selectedEquipmentId === record.id) {
    closePanel(); // toggle
  } else {
    setSelectedEquipmentId(record.id);
    // llamar al use case con record.id, record.equipment, record.currentReading
  }
}
```

### 4. Panel cerrado por defecto

`useState<string | null>(null)` — `null` significa cerrado. No hay auto-selección al montar el componente.

### 5. Cierre explícito

El panel solo se cierra vía:
- Botón "X" en el encabezado del panel → `onClose()` callback
- Clic en la tarjeta activa → toggle en `selectEquipment()`

**No** implementar `onClick` en áreas neutras del dashboard.

---

## Datos mockeados — guía de cobertura

Asegurarse de que los datos de prueba incluyan:

| Activo | Planes | Escenario validado |
|---|---|---|
| ODO-001 (4280h) | 500h cíclico + 1000h cíclico | Fusión → 4500h con actividades combinadas |
| ODO-002 (2150h) | 500h cíclico + umbral fijo 2500h | Competencia → 2500h (fijo gana) |
| ODO-003 (5800h) | 1000h cíclico + umbral fijo 5000h (vencido) | Fijo vencido ignorado → 6000h (cíclico) |
| ODO-004 (3400h) | Solo 1000h cíclico | Happy path simple → 4000h |
| ODO-005 (1900h) | Solo umbral fijo 2000h | Happy path fijo → 2000h |
| ODO-006 (7200h) | Sin planes | Estado vacío → panel muestra mensaje |

---

## Tests obligatorios (mínimo)

```
GetNextMaintenancePlanUseCase
  ✓ calcula el próximo múltiplo para un plan cíclico simple
  ✓ retorna el umbral fijo si es mayor a la lectura actual
  ✓ omite el umbral fijo si la lectura actual lo supera
  ✓ selecciona el menor umbral cuando compiten cíclico y fijo
  ✓ fusiona actividades cuando dos planes coinciden en el mismo umbral
  ✓ retorna null cuando no hay planes para el activo
  ✓ retorna null cuando todos los planes fijos están vencidos y no hay cíclicos
```

---

## Comando de desarrollo

```bash
pnpm dev   # ya en ejecución en tu terminal
```

El dashboard de horómetros está disponible en la ruta de horómetros del proyecto.

