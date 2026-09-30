# Assign Calidad to an existing Ixachi user

## Goal
Assign the existing company-scoped `Calidad` role to Auth user `bacc4adf-147f-4f58-a87d-b81aeefed76e` in Ixachi (`f1000000-0000-0000-0000-000000000001`). Preserve existing user data and do not change operational scope.

## Read-only production preflight
- Ixachi is active.
- Target Auth user exists, email is confirmed, and `public.users` profile is active.
- Target has no RBAC principal, Ixachi membership, role assignments, or operational scope.
- `Calidad` exists in Ixachi with 16 permission links matching `Tool Pusher` exactly (symmetric difference 0).

## Constraints
- Add only the missing principal/membership/role assignment; preserve any other roles if present at execution.
- Fail if the Auth user/profile/company/role is missing or inactive, or if an existing principal/membership is inactive.
- Do not change role permissions, company modules, operational scope, assets, or other users.
- SQL admin session has no authenticated actor; do not fabricate an app audit event.

## Tasks
1. [x] Read-only preflight of target user and Calidad role.
2. [x] Add required active principal/membership and Calidad assignment atomically; the retry returned successfully.
3. [x] Verify RBAC rows and authenticated authorization projection.

## Execution note
- First transaction attempt timed out. A subsequent read-only reconciliation found no principal, membership, role assignment, or scope changes; the request was not applied.
- Retried with a shorter atomic block; the linked Supabase SQL command returned successfully. Operational scope remains untouched.
- Read-only post-provision verification completed without blockers.

## Verification results and limits
- Profile, principal, and Ixachi membership are active; assigned roles are exactly `Calidad`.
- `Calidad` and `Tool Pusher` each have 16 permissions; symmetric difference is 0.
- Authenticated projection for the target renewed authorization and returned `can_read_catalog = true` with 16 capabilities.
- Operational scope remains absent (`assigned=false`, `allRigs=false`, empty rig list); `rbac_operational_rig_allowed` returned false for Rig 702 and 703.
- Separately, `read:assets` under the enabled `operations` module is true. The `assets_same_company_read` RLS policy allows that company-scoped read without operational rig scope; an authenticated simulation could select 376 Ixachi asset rows. This is read visibility, not an operational rig assignment.
- The first transaction attempt timed out and was reconciled as unapplied; the shorter retry succeeded. No real HTTP/PostgREST request or actor-attributed audit event was made.

## Relevant files
- `supabase/migrations/20260905100000_provision_rbac_user_access_rpc.sql`
- `supabase/migrations/20260825190000_rbac_multitenant_audit.sql`
- `supabase/snippets/8. provision_user_company_role.sql` (reference only; no edit requested)
