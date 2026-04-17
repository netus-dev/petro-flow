# Phase 1: Data Model

## State Entities

### ThemeState (Zustand Store)
- **name**: `useThemeStore`
- **fields**:
  - `theme`: `Theme` (enum: 'light' | 'dark' | 'system')
  - `systemTheme`: `Theme` (enum: 'light' | 'dark') - Valor resuelto actual si la preferencia está en 'system'.
- **transitions**:
  - `setTheme(theme: Theme)`: Actualiza la preferencia en el store y debe disparar la función `setTheme` de `next-themes` de manera simbiótica para mutar el DOM.

## Data Persistence
- **Storage Strategy**: LocalStorage del navegador.
- **Security Check**: Ninguna data PII manejada. No se requiere cifrar la llave.
- **Conflict Resolution**: `next-themes` se mantiene como la fuente de control del Provider de la app, Zustand como el controlador del estado global visible para interfaces no vinculadas al DOM Theme Layout.
