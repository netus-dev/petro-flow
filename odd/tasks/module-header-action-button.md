# Module header action button

## Goal
Standardize icon-only action buttons used in module headers, including Trazabilidad and Hour Meters, and ensure Trazabilidad header actions have tooltips.

## Tasks
- [x] Map current header action button patterns in Hour Meters and Trazabilidad.
- [x] Create or reuse a shared global module-header action button with controllable visual level.
- [x] Migrate Hour Meters and Trazabilidad header actions to the shared button and preserve tooltips.
- [x] Verify focused checks.

## Evidence
- Started: 2026-10-02.
- Added `ModuleHeaderActionButton` with shared icon-only sizing, accessible label, and `primary`/`secondary`/`accent` levels.
- Replaced Hour Meters inventory, maintenance settings, and register reading header buttons with the shared component while preserving the existing tooltip composition around `DialogTrigger`.
- Replaced Trazabilidad asset and movement registration header triggers with the shared component; asset action remains limited to `/trazabilidad/assets` routes.
- Added `triggerTooltip` support to `RegisterAssetModal` so custom dialog triggers can keep the Radix order `TooltipTrigger -> DialogTrigger -> button` without wrapping a dialog trigger around a tooltip root.
- Verification: `npx eslint src/core/presentation/components/layout/module-header-action-button.tsx src/features/hour-meters/presentation/components/hour-meters-content.tsx src/features/trazabilidad/presentation/components/trazabilidad-layout.tsx src/features/trazabilidad/presentation/components/register-asset-modal.tsx` passed.
- Verification: `npx tsc --noEmit --pretty false` passed.
- Commit: work-unit commit `feat(ui): standardize module header action buttons`.
