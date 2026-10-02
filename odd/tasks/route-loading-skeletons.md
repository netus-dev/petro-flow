# Add route-level loading skeletons for Trazabilidad and Hour Meters

## Goal
Replace generic route loading states with layout-preserving `loading.tsx` skeleton screens for the Trazabilidad and Hour Meters routes.

## Confirmed design
- Use Next.js App Router `loading.tsx` route-segment convention for server route loading fallbacks.
- Keep skeleton UI close to the corresponding route segment so it mirrors the page structure without making data routes client-only.
- Reuse the existing shared `Skeleton` UI primitive from `src/core/presentation/components/ui/skeleton.tsx`.
- Preserve existing client-side loading behavior where it represents post-render interactions, but avoid generic spinners for predictable layouts.

## Scope and constraints
- Implement Trazabilidad first, then Hour Meters.
- Use route-level files under `app/(authenticated)/.../loading.tsx`.
- Do not alter data fetching semantics or authorization behavior.
- Keep generated technical artifacts in English.
- Commit each finished work unit with tests/checks evidence.

## Tasks
1. Map existing routes and reusable skeleton primitives. (done)
2. Implement Trazabilidad route loading skeletons. (done)
3. Implement Hour Meters route loading skeletons. (done)
4. Run focused checks and record evidence. (done)

## Evidence
- Previous location-filter fix committed before this feature: `18b5b47` (`fix(trazabilidad): keep asset location filter selection`).
- Read-only route map confirmed existing Trazabilidad segment loading and missing nested Trazabilidad/Hour Meters route loading files.
- Added Trazabilidad route loading fallbacks for dashboard, assets list, asset detail, movements list, and movement detail using the shared `Skeleton` primitive.
- Added Hour Meters route loading fallbacks for dashboard and registration form using the shared `Skeleton` primitive.
- Focused lint passed: `pnpm exec eslint 'app/(authenticated)/trazabilidad/loading.tsx' 'app/(authenticated)/trazabilidad/assets/loading.tsx' 'app/(authenticated)/trazabilidad/movements/loading.tsx' 'app/(authenticated)/trazabilidad/assets/[assetId]/loading.tsx' 'app/(authenticated)/trazabilidad/movements/[movementId]/loading.tsx' 'app/(authenticated)/hour-meters/loading.tsx' 'app/(authenticated)/hour-meters/register/loading.tsx' 'src/features/trazabilidad/presentation/components/trazabilidad-route-loading.tsx' 'src/features/hour-meters/presentation/components/hour-meters-route-loading.tsx'`.
- Focused tests passed: `pnpm vitest run 'app/(authenticated)/hour-meters/page.test.tsx' src/features/trazabilidad/presentation/lib/url-filters.test.ts` (`2 passed`, `6 passed`).
- Runtime harness: N/A because route-level loading fallbacks require browser navigation timing to observe; focused lint and existing route/page tests are the practical automated boundary.
- Rollback boundary: remove the new route `loading.tsx` files and route loading component files, or revert the work-unit commit.
