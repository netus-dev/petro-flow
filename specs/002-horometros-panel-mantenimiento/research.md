# Research: Panel de Plan de Mantenimiento — Hour Meters

**Feature**: 002-horometros-panel-mantenimiento  
**Date**: 2026-06-23  
**Phase**: 0 — Outline & Research

---

## 1. Patrón de arquitectura existente en `hour-meters`

### Findings
El módulo `hour-meters` actualmente solo tiene `domain/` y `presentation/`; carece de `application/` e `infrastructure/`. Sin embargo, el módulo `lookahead` sirve de referencia completa:

- **Domain**: `entities.ts` + `repositories/[name].repository.ts` (interface)
- **Application**: `usecases/[name].usecases.ts` (clases con DI)
- **Infrastructure**: `datasources/[name].datasource.ts` + `repositories/[name].repository.impl.ts` + `repository.ts` (singleton)
- **Presentation**: `hooks/use-[name].ts` + `components/`

**Decision**: Replicar exactamente esta estructura en `hour-meters` para la nueva funcionalidad de mantenimiento.  
**Rationale**: Consistencia con el resto del proyecto; facilita onboarding y mantenimiento futuro.  
**Alternatives considered**: Colocar la lógica directamente en el hook de presentación (rechazado — viola Clean Architecture y la regla #2 de agents.md).

---

## 2. Algoritmo de cálculo del próximo umbral de mantenimiento

### Findings

El cálculo debe manejar dos tipos de planes:

**Tipo A — Intervalo cíclico** (`intervalHours: number`):
```
nextThreshold = Math.ceil((currentReading + 1) / intervalHours) * intervalHours
```
Si `currentReading` es exactamente un múltiplo del intervalo, el siguiente es `currentReading + intervalHours`.

**Tipo B — Umbral fijo puntual** (`fixedThresholdHours: number`):
```
nextThreshold = fixedThresholdHours   (solo si fixedThresholdHours > currentReading)
// Si currentReading >= fixedThresholdHours → el plan ya venció, no se incluye
```

**Selección del plan a mostrar**:
```
nextThresholds = [
  ...planesA.map(p => calcCyclicNext(p, currentReading)),
  ...planesB.filter(p => p.fixedThresholdHours > currentReading).map(p => p.fixedThresholdHours)
]
selectedThreshold = Math.min(...nextThresholds)
```

**Fusión de actividades** (cuando múltiples planes coinciden en `selectedThreshold`):
```
matchingPlans = allPlans.filter(p => getNextThreshold(p, currentReading) === selectedThreshold)
unifiedActivities = matchingPlans.flatMap(p => p.activities)
```

**Decision**: Lógica pura sin efectos secundarios, implementada íntegramente en `GetNextMaintenancePlanUseCase.execute()`.  
**Rationale**: Maximamente testeable (entrada → salida determinista). No depende de estado externo.  
**Alternatives considered**: Calcular en el hook de presentación (rechazado — la lógica de negocio pertenece a la capa Application).

---

## 3. Estructura del dato mockeado

### Findings

El patrón de `useHourMeters` usa un array estático `initialRecords` con todos los datos. Se aplicará el mismo patrón para `MaintenancePlan`.

Cada activo (identificado por `equipmentId === HourMeterRecord.id`) tendrá un array de planes. Ejemplo:

```typescript
// ODO-001 "Motor Principal MP-01" — currentReading: 4280
[
  { id: 'mp-001-a', equipmentId: 'ODO-001', intervalHours: 500, activities: [...] },
  { id: 'mp-001-b', equipmentId: 'ODO-001', intervalHours: 1000, activities: [...] },
  { id: 'mp-001-c', equipmentId: 'ODO-001', fixedThresholdHours: 5000, activities: [...] },
]
// → próximo umbral: min(4500, 5000, 5000) = 4500 (cíclico 500h)
// → 4500h: solo mp-001-a coincide → lista individual
```

**Decision**: Datos mockeados en `MaintenanceDatasource` con al menos 2 tipos de planes por activo para validar el escenario de fusión.  
**Rationale**: Permite desarrollar y probar sin backend; alineado con el assumption de v1 del spec.  
**Alternatives considered**: Supabase desde el inicio (rechazado — la tabla no existe aún; el spec establece explícitamente datos mockeados en v1).

---

## 4. Diseño del panel lateral (layout)

### Findings

El contenedor actual en `hour-meters-content.tsx` es:
```jsx
<div className="flex flex-col h-screen ...">
  <header />       {/* shrink-0 */}
  <div stats />    {/* shrink-0 */}
  <div grid />     {/* flex-1 */}
</div>
```

Para agregar el panel lateral, el `<div grid>` debe convertirse en un contenedor `flex-row`:
```jsx
{/* NUEVO — contenedor flex-row que aloja grid + panel */}
<div className="flex-1 flex flex-row gap-4 min-h-0 overflow-hidden">
  {/* Grid original — se contrae cuando el panel está abierto */}
  <div className={`min-h-0 grid ... ${panelOpen ? 'flex-1' : 'w-full'}`}>
    {cards}
  </div>
  {/* Panel lateral — aparece como hermano del grid */}
  {panelOpen && <MaintenancePanel asset={selected} onClose={closePanel} />}
</div>
```

**Decision**: El panel lateral es un sibling del grid dentro del mismo contenedor padre, no un overlay/modal en desktop. En móvil (< 1024px) se adapta a `fixed inset-0` drawer.  
**Rationale**: Cumple exactamente FR-002 y FR-003 del spec.  
**Alternatives considered**: Drawer de Radix UI (rechazado para desktop — cambia la naturaleza de layout sibling requerida; se puede usar para mobile).

---

## 5. Gestión del estado de "tarjeta seleccionada"

### Findings

El estado de selección es local a `HourMeterContent` — no necesita ser global en Zustand porque no se consume fuera del dashboard de horómetros. Se usa `useState<string | null>` para el `selectedEquipmentId`.

**Decision**: `useState` local en `HourMeterContent`, encapsulado en el hook `useMaintenancePanel` para separar concerns.  
**Rationale**: Evita complejidad innecesaria de Zustand para estado puramente local a una pantalla.  
**Alternatives considered**: Zustand store (considerado — pero el estado no se comparte con otros módulos en v1; se puede migrar si se necesita en el futuro).

---

## 6. Testing — enfoque para Use Cases

### Findings

El `GetNextMaintenancePlanUseCase` es la lógica de negocio más crítica. Los tests deben cubrir:
1. **Happy path cíclico**: activo con un plan cíclico → calcula el siguiente múltiplo correcto
2. **Happy path fixed**: activo con un plan fijo > currentReading → lo selecciona
3. **Competencia cíclico vs fijo**: el fijo vence antes que el siguiente múltiplo → selecciona el fijo
4. **Fusión de planes**: dos planes coinciden en el mismo umbral → actividades unificadas sin duplicados
5. **Plan fijo vencido**: `fixedThresholdHours <= currentReading` → se omite del cálculo
6. **Sin planes**: el use case retorna `null` o `Either.left(NoPlansFailure)`

**Decision**: Tests con Vitest (o Jest); mocks del repositorio mediante implementación manual del interface.  
**Rationale**: Lógica pura → tests unitarios simples y rápidos; no requieren base de datos ni red.

