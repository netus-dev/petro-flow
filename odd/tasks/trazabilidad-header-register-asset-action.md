# Trazabilidad header register asset action

## Goal
Move the `Registrar activo` action from the `/trazabilidad/assets` page body into the `ModuleHeader` actions list, positioned to the left of the existing register-movement action.

## Tasks
- [x] Map current Trazabilidad layout/page action ownership.
- [x] Move asset registration trigger into the module header actions for the assets route.
- [x] Verify focused behavior for the changed files.
- [x] Commit the work unit.

## Evidence
- Started: 2026-10-02.
- `TrazabilidadLayout` now renders `RegisterAssetModal` before `RegisterBatchMovementModal` only when the current pathname is within `/trazabilidad/assets`.
- Asset registration still calls `registerTrazabilidadAsset(asset)` and then `router.refresh()` after success.
- `TrazabilidadAssetsPage` no longer renders the body-level `RegisterAssetModal`; table filters and edit flow remain in place.
- Verification: `npx eslint src/features/trazabilidad/presentation/components/trazabilidad-layout.tsx src/features/trazabilidad/presentation/components/trazabilidad-assets-page.tsx` completed with no output.
- Verification: `npx tsc --noEmit --pretty false` completed with no output.
- Commit: current work-unit commit (`feat(trazabilidad): move asset registration to header`).
