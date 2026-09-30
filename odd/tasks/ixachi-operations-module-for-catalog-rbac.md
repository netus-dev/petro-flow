# Enable the operations module for Ixachi catalog RBAC

## Goal
Allow the existing `read/catalogs` capability assigned through `Tool Pusher` to satisfy the catalog authorization gate for Ixachi, and preserve the change in the reusable SQL snippet.

## Confirmed design
- `rbac_can_read_catalog(company_id)` requires the role capability `read/catalogs` and the company-level `operations` module to be enabled.
- `operations` is stored in `public.rbac_company_modules`; it is not a role permission.
- The user explicitly approved enabling `operations` company-wide for Ixachi. Enabling the module does not itself grant `read/catalogs`; capability checks remain in place.
- Production currently has no `operations` row for Ixachi.
- Preserve the existing local/untracked snippet and all unrelated working-tree changes.

## Scope and constraints
- Add an idempotent company-module enablement to `supabase/snippets/7. assign_role_to_user.sql`.
- Enable only Ixachi's `operations` module in production.
- Do not modify assets, principles, or seed data.
- Verify the production row and, if the available authenticated context permits, the catalog authorization and embedded relation behavior.
- Do not commit or publish without explicit user authorization.

## Tasks
1. Update snippet 7 with an idempotent `operations` module upsert. (done)
2. Enable the Ixachi `operations` module in production. (done)
3. Verify the production state and the catalog read path; report any unavailable authenticated/PostgREST check honestly. (done)

## Evidence
- User approved company-wide scope after being told `operations` is company-level.
- Read-only production query confirmed no `(company_id, 'operations')` row before change; the production upsert returned the Ixachi `operations` row with `enabled = true`.
- Under `SET LOCAL ROLE authenticated` with tp.703's JWT subject and Ixachi `x-company-id`, `rbac_can_read_catalog` returned `true`, `rbac_renew_authorization` returned `true`, and `authorization_projection` showed `Tool Pusher`, `read/catalogs`, and enabled module `operations`.
- Under that authenticated DB context, the `assets LEFT JOIN functional_principles` RLS check returned 376 assets with non-null FKs, 376 visible principles, and 0 unresolved relations; the visible names included `Generador`. This validates the database-level relation visibility; a separate PostgREST HTTP response was not exercised.
- Native review could not isolate the work unit from unrelated ambient changes. A committed-only start using the parent as `baseRef` was rejected before authority creation with `candidate-target-projection-drift` (`lineage_created=false`, no mutation); no review capture was run.
- Work-unit commit: `87a6a7858cf0f2caa2b111b4d9d2803b63687a29` (`fix(rbac): enable Ixachi catalog operations gate`) on branch `fix/ixachi-operations-catalog-rbac`; it contains this task record and snippet 7. No push or publish.
