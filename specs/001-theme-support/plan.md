# Implementation Plan: Light/Dark Mode Support

**Branch**: `001-theme-support` | **Date**: 2026-04-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-theme-support/spec.md`

## Summary

Implementar y pulir el soporte de Temas Claro y Oscuro (Light/Dark Mode) utilizando `next-themes` para mitigar el FOUC e integrando Zustand para la persistencia global de la preferencia, priorizando las preferencias del sistema operativo del usuario.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.x, Next.js 16.x  
**Primary Dependencies**: `next-themes`, `zustand` 5.x, Tailwind CSS 4.x  
**Storage**: Client LocalStorage (via Zustand persist)  
**Testing**: Unit tests para Zustand (Ej. Vitest/Jest), Lighthouse para contraste.  
**Target Platform**: Web Browsers  
**Project Type**: Next.js Web Application  
**Performance Goals**: Cambio de tema < 100ms, 0 frames de FOUC al cargar.  
**Constraints**: Todos los componentes deben cumplir WCAG > 4.5:1. 

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Estándares Tecnológicos**: Se emplea Zustand, Next.js y Tailwind CSS, todos permitidos.
- **Rendimiento e Hidratación (RSC)**: Se respeta el Next.js First. `next-themes` requiere un Client Component provider en la raíz (Layout), pero no interfiere con el renderizado de los RSC en el árbol inferior (no hay prop-drilling bloqueante).
- **Cumplimiento y Gobernanza**: NO hay hardcodeos de configuraciones dependientes de servidor.
- **Resultado del Gate**: **PASS**.

## Project Structure

### Documentation (this feature)

```text
specs/001-theme-support/
├── plan.md              # This file
├── research.md          # Research about next-themes & Zustand hydration
├── data-model.md        # State interface definition
├── quickstart.md        # How to consume the theme
├── contracts/           # Interfaces
└── tasks.md             # Tasks to implement
```

### Source Code (repository root)

```text
# General Web Application
src/
├── app/
│   └── layout.tsx                     # Inyección del provider a la app
├── core/
│   └── presentation/
│       ├── providers/
│       │   └── ThemeProvider.tsx      # Wrapper para next-themes
│       └── components/
│           └── ui/
│               └── ThemeToggle.tsx    # Componente base de interfaz de Switch
├── features/
│   └── dashboard/
│       └── presentation/
│           └── components/
│               └── dashboard-navbar.tsx # Reemplazo y consumo del toggle HTML nativo
├── application/
│   └── stores/
│       └── useThemeStore.ts           # Estado global Zustand (opcional/sincronizado)
```

**Structure Decision**: La estructura se alinea con la Clean Architecture recomendada por el documento `agents.md`, ubicando los componentes visuales inyectables directamente en las _features_ correspondientes (como el dashboard), inyectando lógica global en `core` y la orquestación del Store en `application`.

## Complexity Tracking

No se registraron violaciones a la arquitectura de la constitución. Todo está acorde.
