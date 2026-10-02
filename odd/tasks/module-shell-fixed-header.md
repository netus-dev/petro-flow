# Keep module headers outside module content scroll

## Goal
Introduce a shared module shell so module headers remain visible while only the module content scrolls.

## Confirmed design
- Do not make `ModuleHeader` responsible for scroll behavior with `sticky`/`fixed` positioning.
- Add a shared `ModuleShell` layout component that renders a fixed header region and a scrollable content region.
- Migrate modules that currently use `ModuleHeader`: Trazabilidad and Hour Meters.
- Preserve module data fetching, authorization, actions, navigation, and interaction behavior.

## Scope and constraints
- Keep `ModuleHeader` reusable and layout-agnostic.
- Apply the shell first to Trazabilidad and Hour Meters only.
- Avoid broad app layout refactors unless required.
- Preserve unrelated formatting-only changes already present in the worktree.

## Tasks
1. Create shared `ModuleShell`. (done)
2. Migrate Trazabilidad layout to `ModuleShell`. (done)
3. Migrate Hour Meters content to `ModuleShell`. (done)
4. Run focused checks and record evidence. (done)

## Evidence
- Prior sticky-only attempt on `ModuleHeader` was insufficient because the real scroll container is higher in the authenticated layout.
- Added `ModuleShell` with a non-scrolling header region and an internal `overflow-y-auto` content region.
- Migrated Trazabilidad route layout to render `ModuleHeader` through `ModuleShell`.
- Migrated Hour Meters dashboard content to render `ModuleHeader` through `ModuleShell`.
- Added `min-h-0` to the authenticated content wrapper so child flex shells can own their internal scroll area.
- Focused lint passed: `pnpm exec eslint 'app/(authenticated)/layout.tsx' src/core/presentation/components/layout/module-header.tsx src/core/presentation/components/layout/module-shell.tsx src/features/trazabilidad/presentation/components/trazabilidad-layout.tsx src/features/hour-meters/presentation/components/hour-meters-content.tsx`.
- Focused tests passed: `pnpm vitest run 'app/(authenticated)/hour-meters/page.test.tsx' src/features/trazabilidad/presentation/lib/url-filters.test.ts` (`2 passed`, `6 passed`).
- Rollback boundary: remove `ModuleShell`, revert Trazabilidad and Hour Meters migrations, and remove the authenticated wrapper `min-h-0` adjustment.
