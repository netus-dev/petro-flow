# Onboard the Rig Manager user in Ixachi

## Goal
Create the Ixachi company-scoped `Rig Manager` role with the reviewed `Tool Pusher` permission set, assign it to Auth user `3d595e9d-c30d-4790-bf53-4cbc93d2b100`, and give that user the explicit `all_rigs = true` operational scope. Reuse and extend the guarded onboarding logic in snippet 8.

## Initial production state
- Ixachi is active: `f1000000-0000-0000-0000-000000000001`.
- Target Auth user exists, email is confirmed, and `public.users` profile is active.
- Target has no RBAC principal, Ixachi membership, role assignment, or operational scope.
- `Rig Manager` does not exist in Ixachi.
- `Tool Pusher` still has the reviewed 16 action/resource permissions, including create/delete/manage grants.
- The operational scope helper is company-scoped: `all_rigs = true` allows every active rig in Ixachi, not rigs in other companies.
- Existing company modules are enabled; do not alter them.

## Constraints and decisions
- `all_rigs` is a per-user operational scope, not a role permission. Only the requested target user receives it.
- Pin and lock the 16 approved source role permission pairs; abort if the live set changes.
- Add principal/membership only if absent; fail on inactive rows rather than reactivating them. Preserve any other target role assignments.
- Create or reuse `Rig Manager` only if its permission set is compatible; do not silently change access for any other role holder.
- Do not modify Auth identity/profile, other users, company modules, assets, or seed snippets.
- Preserve audit integrity. The SQL admin connection has no authenticated actor; do not invent one.
- User requested this role before saving changes; prepare scoped local commits for only the onboarding code/task artifacts after verification. No push.

## Tasks
1. [x] Extend snippet 8 with a fail-closed explicit `all_rigs` scope mode while preserving the existing `copy_source` mode; read-only verifier found no blockers.
2. [x] Apply `Rig Manager` onboarding to the approved target in Ixachi production; linked Supabase SQL returned successfully.
3. [x] Verify exact permission equivalence, RBAC relationships, `all_rigs = true`, and authenticated projection across active Ixachi rigs.
4. [x] Save only this related work in scoped local commits; do not push.

## Implementation progress
- The snippet configuration now targets this user and `Rig Manager`, with `v_scope_mode = 'all_rigs'` and no source-scope user.
- Scope modes are explicit (`copy_source`, `all_rigs`, `none`); the all-rigs branch changes only the target user's Ixachi scope and preserves existing per-rig links.
- Read-only code verification found no blockers. No SQL parser or separate transaction test was run; production snippet execution is the integration check.
- The production command `supabase db query --linked --file "supabase/snippets/8. provision_user_company_role.sql" --output-format json` returned successfully with no error; the `DO` block emits no result rows.
- Read-only production verification completed without blockers.

## Verification results and limits
- Profile, principal, and Ixachi membership are active; the target's assigned role list is exactly `Rig Manager`.
- Source and target role permission counts are 16; symmetric difference is 0.
- Target scope exists with `all_rigs = true`; no individual rig-link rows are needed for the all-rigs state.
- Under simulated authenticated claims, renewal and catalog-read checks are true; projection contains all 16 capabilities and enabled Ixachi modules.
- `rbac_user_rig_scope` enumerated the two active Ixachi rigs (702 and 703), and `rbac_operational_rig_allowed` returned true for each (`denied_rig_ids = []`).
- No real HTTP/PostgREST request was made. The SQL-admin session has no authenticated actor, so no actor-attributed app audit event was written.

## Native review status
- Inspect selected the task documents and snippet 8, but the workspace candidate also includes pre-existing modifications to seed snippets 1–6.
- No review START/capture was run to avoid reviewing unrelated files; native review remains pending safe isolation.

## Commit evidence
- Code work-unit commit: `ceb5da5f8dbf39790a905bc13bca91debeca631a` — `feat(rbac): support all-rigs user onboarding scope`.
- Documentation work-unit commit: `dd238b73da9c0234f55ab4f6face9c7a47ef8d26` — `docs(odd): record Ixachi user onboarding evidence`.

## Runtime and rollback
- No separate unit-test harness exists for this SQL snippet; the linked production `DO` transaction and both read-only verification queries are the integration evidence.
- Rollback boundary: the code commit changes only snippet 8. Reverting the production user's RBAC/scope records is a separate targeted admin operation and was not performed.

## Relevant files
- `supabase/snippets/8. provision_user_company_role.sql`
- `supabase/migrations/20260902090000_operational_rig_scope_mvp.sql`
- `supabase/migrations/20260905100000_provision_rbac_user_access_rpc.sql`
- `odd/tasks/onboard-calidad-user-ixachi.md`
