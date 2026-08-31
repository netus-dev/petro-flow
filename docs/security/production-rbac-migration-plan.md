# Petro Production RBAC Migration Plan

**Status:** Preflight and design only. **No remote DDL, DML, storage mutation, or migration execution is authorized by this document.**

**Target:** Confirmed remote Supabase project `Petro`, ref `suthxuhsotxbyvadhdsc`.

## Executive Summary

Commits `e8a5d38` and `fc87d26` are valuable local rehearsal and test evidence, not production migrations. They prove the intended ID-preserving consolidation shape, membership-before-profile-cutover rule, FK repointing checks, certificate ownership checks, final retirement checks, and rollback-oriented checkpointing. They must be rewritten into a production migration sequence because Petro currently has the legacy schema, no `rbac_*` objects, live legacy rows, incomplete remote grants evidence, and storage ownership rules that are broader than the intended tenant policy.

The migration is **blocked** until a privileged, read-only preflight produces a complete catalog and backup/restore evidence, verifies all mappings, and receives explicit approval for identity bootstrap, platform administration, permission grammar, Storage ownership, outage/lock budget, and rollback authority. The user statement that Petro has only two development users is currently consistent with the preflight (`2 public.users`, `2 auth.users`), but it remains a gate result, not an assumption.

## Evidence Reviewed

- `e8a5d38`: local profile-trigger, RBAC backfill, company FK repoint, `users.company_id` removal, and `companies` retirement rehearsals; seed and pgTAP coverage.
- `fc87d26`: transactional historical backfill checkpoint, preserving pre-retirement assertions without retaining compatibility objects.
- `docs/security/remote-petro-schema-baseline.md`: remote catalog and policy baseline captured read-only on 2026-08-27.
- `docs/security/schema-consolidation-migration-design.md`: accepted target invariants, ordering, validation, and rollback design.
- `docs/security/local-rbac-consolidation-preflight.md` and `docs/security/local-legacy-backfill-checkpoint.md`.
- Uploaded read-only catalog CSVs under `docs/supabase_csv/` (reconciled 2026-08-28). These provide substantive constraints, indexes, routine definitions, RLS flags, ordinary trigger rows, enabled event-trigger names/state, and policy rows. `tables-and-columns.csv` still has two observed ordinal gaps (`transactions` 2 and `user_roles` 4); the CSVs do not provide ACL/grant data, event-trigger definitions, Storage delete policy evidence, or backup/restore evidence.

Remote preflight currently verifies: `public.users = 2`, `auth.users = 2`, exact user/auth linkage for both rows, `public.companies = 2`, `roles = 2`, `user_roles = 1`, `permissions = 0`, and `role_permissions = 0`. The baseline also records one private `certificates` bucket, two remote migrations, all public/storage tables under RLS, and three broad authenticated Storage policies. Complete grants, some routine security metadata, and a production backup were not captured.

The uploaded CSVs add concrete blockers: `get_asset_stats_by_functional_principle` is a `SECURITY DEFINER` function with no fixed `search_path`; enabled event triggers include `ensure_rls` plus Supabase/PostgREST integration triggers whose definitions are not present; policy rows remain broadly permissive for `{authenticated}` and Storage has no delete policy row; ACL/grant evidence is absent; and two column ordinals are missing from the otherwise substantially populated column export. The refreshed files do not establish production authorization approval.

## Reuse Versus Rewrite

### Reuse as evidence and test specification

- Preserve UUID identity and company payload invariants from the local consolidation rehearsal.
- Reuse exact-auth-ID principal validation, membership independent of roles, scoped assignments, malformed permission quarantine, inactive-deny behavior, idempotency assertions, catalog dependency scans, and Storage path/owner checks.
- Reuse the checkpoint harness and pgTAP scenarios as local regression evidence only.
- Reuse the final-state rule that `rbac_compat_exceptions` is temporary and absent from production.

### Rewrite before production

- Replace local migration files and synthetic seed IDs with a production-specific, additive, migration-owner-controlled sequence. Do not deploy `local_*` migrations or `supabase/seed.sql` to Petro.
- Replace assumptions about empty/local tables with live preflight reports and explicit mapping manifests.
- Replace `users.company_id` removal timing with an application-compatible expand/contract cutover; remove it only after all consumers, policies, RPCs, triggers, generated types, and deployed clients are migrated.
- Replace local compatibility cleanup with an observable deprecation window and runtime call telemetry.
- Replace broad legacy policy behavior and unaudited RPC execution with deny-by-default RLS, fixed `search_path`, explicit ownership, and reviewed EXECUTE grants.
- Replace the local certificate fixture with a verified remote object-to-row ownership manifest and an approved path contract.

## Required Preflight Evidence

Run read-only checks against the confirmed target and save immutable, timestamped results. Do not proceed on partial output.

1. Export exact tables, columns, defaults, constraints, indexes, views, routines, triggers, event triggers, owners, RLS/force-RLS, every policy expression, grants/ACLs, extensions, migration history, and Storage policies.
2. Record row counts, stable UUID sets, required-field hashes/checksums, and all foreign-key dependency edges for companies, users, business tables, RBAC tables, certificates, and `storage.objects`.
3. Obtain a provider-supported backup or snapshot identifier, export completion evidence, retention window, encryption/ownership confirmation, and a successful restore rehearsal into an isolated environment. A logical export alone is insufficient for the final destructive step unless restore is proven.
4. Capture lock/latency estimates and maintenance window approval. Identify the migration owner, emergency operator, observability owner, and rollback authority.
5. Verify grants through a sufficiently privileged catalog connection. The current remote role did not return a complete ACL matrix; RLS policy membership is not grant evidence.

## Identity and Bootstrap

1. Reconcile every `public.users.id` to `auth.users.id` exactly. Preserve Auth UUIDs, profile fields, active state, and verified email evidence. Unmatched, duplicate, ambiguous, or linked-but-unapproved identities stop the migration.
2. Preflight `hola@oalonsodev.com` by exact normalized email and Auth UUID. Do not create a new Auth identity, merge accounts, or alter credentials automatically. If it is the approved bootstrap identity, record the existing UUID and require an explicit out-of-band approval for the initial `platform_admin` assignment.
3. Bootstrap exactly one or more approved recovery administrators through a one-time, audited, server-side operation. No trigger, email, client claim, default company, or self-service flow may grant `platform_admin`.
4. Require active principal, global role, recovery path, and tested revocation before enabling privileged mutations. Keep new-user onboarding profile-only; memberships and roles are explicit grants.

## Company, Role, Permission Mapping

- Preserve each legacy company UUID exactly in `rbac_companies`; reject conflicting duplicate IDs and do not resolve duplicate names heuristically.
- Create memberships from approved legacy membership evidence (`users.company_id` only while it exists), never from `user_roles`. Support multi-company users without collapsing them to a default.
- Map roles by stable role ID and explicit `roles.company_id`; verify active company scope.
- Map permissions only after approving the exact grammar. The candidate `action.resource` grammar accepts exactly two non-empty dot-separated tokens; malformed, orphaned, conflicting, or unscoped rows are quarantined and deny access. Petro currently reports zero legacy permissions, so no permission backfill may be inferred.
- Create assignments only when exact principal, role, company, and active membership all reconcile. A role never creates membership implicitly.
- Preserve inactive state and ensure inactive principal, company, membership, or assignment denies authorization.

## Storage Certificate Ownership

Before any certificate cutover, produce a one-to-one manifest of `certificates.storage_path` to `storage.objects(bucket_id = 'certificates', name)`, preserving `certificates.uploaded_by = storage.objects.owner` or documenting an approved exception. Resolve every missing row, extra object, null owner, owner without a profile, and path outside the approved tenant path scheme. Do not repoint Auth UUIDs or rewrite paths as a convenience.

The current bucket is private, but remote policies allow authenticated insert/select/update for the bucket without a proven owner/path predicate. Rewrite policies to enforce the approved ownership and company authorization contract, test cross-user and cross-company access, and separately approve delete behavior. Storage policy/grant evidence is a hard gate.

## Exact Dependency and Cutover Order

1. Freeze destructive changes; announce window; capture catalog, counts, backup, restore, and rollback receipt.
2. Harden existing SECURITY DEFINER routines first: fixed `search_path`, explicit schema qualification, ownership, and restricted EXECUTE grants. `get_asset_stats_by_functional_principle` is a confirmed blocker because the uploaded function export reports no fixed `search_path`; separately review `rls_auto_enable` and every enabled event trigger before production DDL.
3. Create/verify canonical RBAC tables, keys, indexes, audit structures, and narrowly scoped compatibility reporting. Do not expose write access to compatibility objects.
4. Produce a transaction-scoped dry-run mapping report for identities, companies, memberships, roles, permissions, assignments, business FKs, certificates, and Storage ownership. Stop on any unresolved required item.
5. Backfill canonical companies, principals, memberships, roles, permissions, and assignments idempotently. Keep legacy authority active; never dual-write by default.
6. Add temporary read compatibility only where a named consumer requires it; instrument every call and select one authority for writes.
7. Validate all direct and transitive company references, then repoint only live company FKs to `rbac_companies`, preserving actions, nullability, indexes, and business semantics.
8. Replace legacy RLS predicates with active-principal, active-company, active-membership, and capability checks. Separate `platform_admin` predicates from tenant predicates. Replace broad authenticated CRUD policies.
9. Cut application consumers to canonical IDs/RPCs; deploy generated types and server paths; run parity and deny-by-default checks.
10. Only after zero source/runtime references remain, remove `users.company_id` in a separately approved step. Keep `public.users` as profile data.
11. Observe the agreed window, then remove compatibility objects and finally drop `public.companies` as a separate approved change. Never combine retirement with the first cutover.

## Validation Gates

Every gate is mandatory and recorded against the same target snapshot:

- **Catalog:** complete before/after inventory and zero unexpected dependencies.
- **Backup:** identified snapshot/export, isolated restore pass, and rollback rehearsal.
- **Data:** exact UUID/cardinality and required-attribute parity; zero invalid FKs or orphaned certificates/objects.
- **Identity:** all users Auth-linked; bootstrap identity and recovery operators explicitly approved.
- **Authorization:** A cannot read or mutate B; inactive principal/company/membership denies; platform admin is explicit and audited; stale selectors and claims do not grant access.
- **RLS/RPC:** policy expressions, security mode, search path, ownership, and EXECUTE grants match the approved contract.
- **Application:** smoke tests for auth, catalogs, movements, KPI filtering, certificate upload/read, and RPC output; no `users.company_id` consumer remains.
- **Operational:** lock/latency budget, monitoring, error thresholds, observation window, and named rollback authority are approved.

## Rollback

Stop new writes and revoke new compatibility/RPC execution and active `operate` contexts. Restore the last known-good legacy read/write path, preserve canonical rows, memberships, audit/preflight evidence, consent/session records, and the backup, and block unsupported multi-company operations rather than collapsing them. Reverse FK definitions only from the captured catalog under the rehearsed procedure. Do not delete canonical data, invent emergency dual-write, or recreate `users.company_id` ad hoc. If profile-column removal has occurred, recovery is via the validated restore point, not improvised reverse DDL.

## Explicit Stop Conditions

Stop immediately for any incomplete catalog or ACL result; failed/untested backup restore; unknown target; unexpected users or business volume; unmatched/ambiguous identity; inability to verify `hola@oalonsodev.com`; conflicting company mapping; malformed/orphaned permissions; certificate/object ownership mismatch; invalid FK; broad or unreviewed RLS/Storage policy; missing platform-admin recovery; failed parity/deny-by-default test; lock/latency budget breach; unexpected application errors; compatibility calls after retirement deadline; or any migration error whose transaction boundary is unclear.

## Next Recommended

Run one privileged, read-only Petro preflight that emits the complete evidence bundle and mapping report. Do not create a production migration file or execute remote DDL until that bundle, restore rehearsal, bootstrap decision, Storage ownership contract, permission grammar, and rollback authority are approved.
