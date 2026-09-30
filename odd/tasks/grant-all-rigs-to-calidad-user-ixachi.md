# Grant all active Ixachi rigs to the Calidad user

## Goal
Set operational scope `all_rigs=true` for Auth user `bacc4adf-147f-4f58-a87d-b81aeefed76e` in Ixachi (`f1000000-0000-0000-0000-000000000001`). This is a per-user scope for active rigs in Ixachi only.

## Read-only preflight
- Ixachi company is active; target Auth user and profile are active.
- Target RBAC principal and Ixachi membership are active; assigned role is Calidad.
- No scope row or explicit rig links currently exist.
- Active Ixachi rigs: Rig 702 (`f4000000-0000-0000-0000-000000000001`) and Rig 703 (`f4000000-0000-0000-0000-000000000002`).

## Constraints
- Set only the target user's Ixachi scope to `all_rigs=true`.
- Preserve the Calidad assignment, permissions, any explicit rig-link rows, all other users, and company configuration.
- Do not change profile/Auth state, modules, assets, or seed files.
- SQL admin has no authenticated actor; do not invent audit attribution.

## Tasks
1. [x] Read-only preflight of target, role, scope, and active rigs.
2. [x] Set all_rigs=true atomically for this user and company only; the transaction returned successfully.
3. [x] Verify authenticated scope projection and per-rig operational predicate for every active Ixachi rig.

## Verification results
- Admin state confirms `all_rigs=true`, no explicit rig-link rows, and assigned role remains `Calidad`.
- Authenticated projection reports `assigned=true`, `allRigs=true`, and lists Rig 702 and Rig 703.
- `rbac_operational_rig_allowed` returned true for both active Ixachi rigs; authorization renewal succeeded.
- Authenticated checks ran in a transaction ended with `ROLLBACK`. No real HTTP/PostgREST request or actor-attributed audit event was performed.

## Relevant files
- `supabase/snippets/8. provision_user_company_role.sql` (reference only; current config targets another user and must not be executed as-is)
- `supabase/migrations/20260902090000_operational_rig_scope_mvp.sql`
