# Phase 0: Research & Architecture Decisions

## Hydration and FOUC Mitigation
**Decision:** Adopt `next-themes` library.
**Rationale:** `next-themes` solves the "Flash of Unstyled Content" inherently tied to Next.js SSR and React hydration mismatches. Al interceptar la carga en el `<head>`, injecta la clase de Tailwind (`dark`) o el estilo de sistema antes de renderizar la UI, cumpliendo el requerimiento de tener 0 flashes blancos.
**Alternatives considered:** Custom inline script via `next/script` u override en Document. Descartado por mantenimiento y riesgos de hydration del root layout en versiones modernas de Next.js/React.

## Persistencia y Estado Global
**Decision:** Zustand Persist Middleware vs `next-themes` storage.
**Rationale:** `next-themes` ya almacena su preferencia de forma nativa en LocalStorage (bajo la llave `theme`). No obstante, el sistema de diseño exige accesibilidad universal bajo Zustand como único estado fuente de verdad. Sincronizaremos el hook nativo de `useTheme` de `next-themes` con el store de Zustand para que el UI pueda consumir la data de manera reactiva y escalable.
**Alternatives considered:** Rely completely on `next-themes` and bypass Zustand. Rechazado por políticas de Zustand-First en la arquitectura local.

## Adopción de Preferencia de Sistema
**Decision:** `enableSystem` flag in `next-themes`.
**Rationale:** Permite setear automáticamente "system" como default value. Garantiza que la primera visita recolecte la preferencia OS sin código custom.
