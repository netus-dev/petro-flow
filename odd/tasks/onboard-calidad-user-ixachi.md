# Onboard the Calidad user in Ixachi

## Goal
Provision the existing Auth user `c14c5b2b-09c4-4b38-b29a-41f19c162fac` in Ixachi, create the company-scoped role `Calidad` from the live `Tool Pusher` permission links, assign Calidad, and copy the approved Rig 703 operational scope. Provide a reusable SQL onboarding snippet.

## Initial production state before onboarding
- Ixachi company `f1000000-0000-0000-0000-000000000001` exists and is active.
- The target Auth user exists, email is confirmed, and `public.users` profile exists and is active.
- The target has no `rbac_principals` row, Ixachi membership, role assignment, or operational rig scope.
- `Calidad` does not yet exist in Ixachi.
- Live Tool Pusher has 16 role-permission links. Copy the live links dynamically, scoped to Ixachi; do not reconstruct from seed migrations.
- The current Tool Pusher user has `all_rigs = false` and a single active operational scope to Rig 703 (`f4000000-0000-0000-0000-000000000002`). The user explicitly approved copying this scope to the target.
- Company modules (`access-control`, `hour-meters`, `operations`, `trazabilidad`) are already enabled; do not alter them.

## Constraints
- Do not create or alter the Auth identity; the target account already exists.
- Do not overwrite the existing profile, remove other user assignments, grant all-rigs access, or change any other user's permissions/scope.
- Copy all current Tool Pusher role-permission links, including its destructive/manage permissions, as the user explicitly requested.
- Make the snippet parameterized, idempotent, company-scoped, and fail-closed if an existing Calidad role/scope has conflicting grants.
- Pin the currently approved source role permission snapshot to its 16 action/resource links; lock source rows and copy only from the captured permission IDs.
- Pin the approved operational scope to exactly `all_rigs = false` plus Rig 703; lock source rows and copy only from the captured rig IDs.
- Hold locks on the source company, role, role-permission links, permission rows, source assignment, operational scope, and rig rows through the transaction to prevent READ COMMITTED drift.
- Do not reactivate an existing disabled principal or membership automatically; fail for manual review.
- Preserve audit integrity; the current SQL admin connection has no authenticated actor, so do not fabricate an actor-attributed audit event.

## Tasks
1. [x] Create the guarded, reusable onboarding snippet and pass read-only pre-production verification.
2. [x] Execute the snippet for the approved target in production; the linked Supabase SQL command returned successfully.
3. [x] Verify exact role permissions, required RBAC rows, Rig 703 scope, and authenticated authorization projection.
4. [ ] Run native review only after the candidate is isolated from unrelated pre-existing changes.

## Pre-production verification review
- The first read-only verifier found that the snippet needed to pin the approved 16 action/resource pairs and the exact Rig 703 scope, and should not reactivate disabled principal/membership rows.
- The snippet compares the live Tool Pusher permission array against the reviewed 16-pair snapshot, requires exactly Rig 703 with `all_rigs = false`, and fails on inactive principal/membership state.
- The second read-only verifier found a concurrent-change race because permission/scope validation and copying re-read live rows.
- The snippet now locks the source company, Auth identity, role, permission links/definitions, source assignment, scope rows, and rig locations; it copies only captured permission/rig ID arrays and serializes target role/scope checks.
- The third verifier confirmed source drift is blocked but found the clean target-scope path compares an empty new scope to Rig 703 before inserting the rig row.
- The scope sequence now allows a new/empty restricted scope, rejects a conflicting nonempty set or all-rigs scope, inserts the captured Rig 703 ID, and enforces an exact final match.
- The fourth read-only verifier confirmed the clean first-run path, exact final Rig 703 scope, and source snapshot locking; it reported no blockers before production.

## Production execution
- Read-only preflight confirmed the scope source is active `Tool Pusher 703`, has active principal/membership, `all_rigs=false`, and exactly Rig 703.
- `supabase db query --linked --file "supabase/snippets/8. provision_user_company_role.sql" --output-format json` returned successfully with no error; the `DO` block emits no result rows.
- The SQL-admin context does not create an actor-attributed app audit event.

## Verification results and limitations
- Profile, principal, and Ixachi membership are active; the assigned role list is exactly `Calidad`.
- `Calidad` and `Tool Pusher` each have 16 permission links; symmetric difference is 0.
- Operational scope exists with `all_rigs = false` and exactly Rig 703 (`f4000000-0000-0000-0000-000000000002`).
- Under simulated `authenticated` role/claims, authorization renewal and `rbac_can_read_catalog` both return true; projection contains the 16 reviewed capabilities and enabled modules; `rbac_user_rig_scope` reports only Rig 703 and `rbac_operational_rig_allowed` returns true.
- No real HTTP/PostgREST request was made. The SQL-admin session has no authenticated actor, so no actor-attributed `rbac_audit_events` record was created.

## Native review status
- Inspect resolved intended-untracked scope to only the new task document and onboarding snippet.
- The resulting workspace candidate still includes pre-existing modifications to `supabase/snippets/1. seed_functional_principles_scopes.sql` through `supabase/snippets/6. seed_tool_assets.sql`.
- No START or capture was run to avoid reviewing or freezing unrelated user changes. Native review is pending safe candidate isolation.

## Delivery status
- Shared onboarding snippet code is recorded in commit `ceb5da5f8dbf39790a905bc13bca91debeca631a` (`feat(rbac): support all-rigs user onboarding scope`).
- This task document is being saved in the related documentation work-unit commit; no push. Unrelated pre-existing worktree modifications remain untouched.

## Relevant files
- `supabase/snippets/8. provision_user_company_role.sql`
- `supabase/migrations/20260825190000_rbac_multitenant_audit.sql`
- `supabase/migrations/20260901180000_rbac_admin_mvp.sql`
- `supabase/migrations/20260902090000_operational_rig_scope_mvp.sql`
- `supabase/migrations/20260905100000_provision_rbac_user_access_rpc.sql`
- `supabase/migrations/20260826150000_local_auth_user_profile_trigger.sql`
