# Schema Consolidation Migration Design

**Status:** Accepted architecture; design only. No DDL, DML, migration, or database change is authorized by this document.

## Executive Summary

`public.rbac_companies` is the canonical company table. Legacy `public.companies` is migrated into it with identifiers preserved, and every business-table `company_id` foreign key is physically repointed to `rbac_companies`. `public.users` remains only a business profile table: `users.company_id` is removed directly in the final consolidation migration, and all company membership comes from `rbac_memberships`. Business tables remain owners of business data and behavior; RBAC supplies authorization context through `rbac_principals`, explicit memberships, assignments, and capabilities.

The migration is staged, rehearsed locally, and gated by catalog, data, authorization, and operational validation. Compatibility views/RPCs are temporary read surfaces, not a permanent mapping layer. `public.companies` is dropped only after all dependencies and runtime consumers are retired.

## Target Invariants

1. Every migrated company keeps the same UUID; no company ID translation is permitted.
2. Every business `company_id` is either valid and references `rbac_companies(id)` or is quarantined before constraint validation.
3. `rbac_principals.is_active = false` denies all authorization, including global roles.
4. Company authorization requires an active principal, active company, active membership, and an in-scope assignment/capability.
5. `platform_admin` is a global role represented by `company_id IS NULL`; a tenant-scoped assignment never implies global authority.
6. Only an active existing global platform administrator may assign or revoke `platform_admin`.
7. Email, domain, UI state, JWT claims, legacy default company, and client company selectors are never authority.
8. All privileged mutations are server-side, atomic, and audited.
9. `public.users` stores business profile data only; it is not a source of company membership or authorization.
10. Authorization backfill requires exact identity linkage where `public.users.id = auth.users.id`; unmatched users are recorded in the temporary `rbac_compat_exceptions` rehearsal artifact and never receive access.
11. After cutover, no consumer, RPC, policy, trigger, or seed references `users.company_id`.

## Dependency Order

| Order | Scope | Required outcome |
|---:|---|---|
| 0 | Freeze and baseline | Capture schema, grants, routines, policies, indexes, row counts, checksums, and backup/restore evidence. Freeze destructive company changes. |
| 1 | Canonical company foundation | Create or verify `rbac_companies` and its required keys/attributes. Preserve legacy company UUIDs exactly. |
| 2 | Principal and RBAC foundation | Establish `rbac_principals`, roles, permissions, memberships, assignments, modules, temporary compatibility reporting, and immutable audit behavior. |
| 3 | Legacy authorization backfill | Produce the required temporary preflight report, verify linked business data, and backfill exact identity mappings, memberships, roles, permissions, and assignments. Require `public.users.id = auth.users.id`; unmatched or ambiguous rows fail closed. |
| 4 | Compatibility surfaces | Introduce temporary legacy-name views/projections and narrowly scoped RPC adapters. Keep writes on one explicitly selected authority. |
| 5 | Business FK preparation | Validate every direct and transitive company reference and record dependent constraint/index/policy/routine names. |
| 6 | Physical FK repoint | In dependency order, drop/recreate only the affected FK constraints so business `company_id` references `rbac_companies(id)`. Preserve columns, UUIDs, nullability, delete actions, and business semantics. |
| 7 | RLS/RPC cutover | Replace legacy company predicates with active-principal/membership predicates; harden security-definer search paths and EXECUTE grants. |
| 8 | Consumer cutover | Move application reads and writes to canonical company identity and authorization RPCs. Remove every consumer, RPC, policy, trigger, and seed reference to `users.company_id`; observe parity and deny-by-default metrics. |
| 9 | Final user/company consolidation | After membership backfill and consumer cutover validate successfully, remove `users.company_id` directly in the final consolidation migration. `public.users` remains as the business profile table. |
| 10 | Legacy retirement | Remove compatibility consumers, then views/RPC adapters, then legacy constraints/indexes that have no remaining dependency. Drop `public.companies` only after the exit criteria below pass. |

## ID-Preserving Data Backfill

1. Produce a dry-run report keyed by stable UUID for `companies`, business rows, users, roles, permissions, and join tables.
2. Insert/converge each eligible legacy company into `rbac_companies` using the original `id`; preserve name, description, lifecycle state, and timestamps required by consumers.
3. Reject duplicate IDs with conflicting payloads. Do not resolve duplicate names by choosing a row.
4. Resolve human principals only when `public.users.id = auth.users.id` exactly and the identity is verified. Record unmatched, duplicate, inactive, and ambiguous identities in the temporary `rbac_compat_exceptions` preflight report; do not create authorization rows for them.
5. Create `rbac_memberships` from the approved legacy membership evidence before removing `users.company_id`, independently of roles. Do not derive membership from `user_roles`.
6. Map roles by stable ID and explicit `roles.company_id`; map permissions only under an approved grammar and exact identity rule. Quarantine malformed, unscoped, conflicting, or orphaned rows.
7. Create assignments only when principal, role, company, and active membership resolve consistently. A role never creates membership implicitly.
8. Backfill is idempotent and non-destructive until the final consolidation step. It must not promote inactive records or silently collapse multi-company users; the final step removes `users.company_id` only after replacement memberships validate and the preflight report confirms no linked business dependency requires the legacy identity.

## FK, Index, and Constraint Changes

The migration inventory must be generated from the live catalog immediately before execution; names below are categories, not executable statements.

- Repoint direct company FKs on `assets`, `brands`, `functional_principle_scopes`, `functional_principles`, `locations`, `models`, `permissions` where applicable, `roles`, `suppliers`, `ubications`, and `wells`. `users.company_id` is not repointed: it is removed in the final consolidation migration because `public.users` is profile-only.
- Verify transitive tables (`operating_bases`, `rigs`, `tasks`, `transactions`, and transaction details) through their owning relationships; do not add redundant `company_id` columns solely for migration convenience.
- Preserve all primary keys, unique constraints, enum behavior, nullability, defaults, update triggers, and delete/update actions unless a separately approved semantic change exists.
- Rebuild or retain company-key indexes after the FK swap. Validate index predicates and names against the catalog rather than assuming local schema parity.
- Validate constraints in a non-destructive phase first; only then enable/validate the new FKs.
- Do not drop legacy constraints or indexes until dependency scans and runtime telemetry show no consumer uses them.

## Compatibility Views and RPCs

Temporary compatibility views may expose legacy column/table names while returning canonical company rows. They must be read-only where possible and must not manufacture a second company identity. Compatibility RPCs must:

- accept stable IDs, validate the active principal and requested company, and reject caller-supplied authority;
- use fixed `search_path`, explicit `SECURITY INVOKER` or narrowly justified `SECURITY DEFINER`, and restricted EXECUTE grants;
- preserve response shape only for migrated consumers, with deprecation telemetry;
- avoid caller-supplied user/rig/company lookups that bypass authorization;
- be removed after consumer migration, not retained as an undocumented permanent API.

## RLS and RPC Changes

RLS policies must require the principal kill switch, active company, active membership, and capability appropriate to the operation. Global `platform_admin` checks are separate from tenant predicates and must not broaden ordinary tenant reads accidentally. Company selectors remain request/session context and are validated, never trusted.

Privileged role assignment/revocation must run in one audited transaction. The actor must already be active and globally assigned `platform_admin`; self-grant, self-escalation, inactive actors, and client-only mutations fail closed. Revoke/deactivate must affect subsequent server checks despite stale sessions or cached profile data. Existing broad authenticated CRUD policies must be replaced or explicitly proven safe before cutover.

## Minimum Preview Contract

Preview is a support-access contract, not a permanent tenant-role assignment and not unrestricted impersonation. The MVP establishes the contract, schema compatibility, and RLS/RPC enforcement boundary; a complete support UI and workflow are deferred.

### Modes

- `observe` is the default mode and is read-only. It permits an authorized support actor to inspect a company through the selected preview context without creating tenant membership or changing tenant data.
- `operate` is an explicit, time-limited mode for a narrow allowlist of support mutations needed to diagnose or repair approved tenant state. It never grants general administrative authority and never changes the actor's permanent RBAC assignments.

### Consent and Session Context

Entering `operate` requires customer consent represented by a one-time code or request scoped to one company. The consent record must include the reason, customer approver, expiry, and revocation state. Consent is invalid outside its company scope, after expiry, or after revocation; it is not reusable as a standing grant.

The server creates a signed, HttpOnly session context after validating the request and consent. Every request revalidates that context server-side, including actor status, company status, mode, consent scope, expiry, and revocation. Client-selected company, mode, role, or claims are request inputs only and are never authority.

Every Preview read and mutation is attributed to the real support actor, the affected company, the selected preview context, the mode, the consent/request identifier, and the reason. Audit records must capture authorization outcome, operation, target, timestamp, and failure or denial reason. Audit history is retained through rollback and cannot be used to conceal a support action.

The Preview contract forbids mutations to users, roles, permissions, memberships, assignments, platform-admin state, authentication/security settings, billing, audit records, consent records, or other security/administrative controls. Any operation outside the approved support allowlist fails closed. Full support UI, consent UX, mutation catalog, and operational workflow remain later work.

## Validation Gates

| Gate | Pass condition |
|---|---|
| Catalog | Exact pre/post inventory exists for tables, columns, FKs, indexes, checks, routines, triggers, grants, RLS, policies, and storage. |
| Identity | Company UUID/cardinality equality; no duplicate/conflicting company mapping; verified principal mapping has no unexplained exceptions. |
| Referential integrity | Zero invalid company references; every new FK validates; no unexpected cascade or orphan. |
| Authorization | Company A cannot read or mutate B; inactive principal/membership/company denies; stale selector denies; global admin works only through explicit global assignment. |
| Backfill parity | Every uniquely resolvable legacy membership/assignment has one canonical result; exact `public.users.id = auth.users.id` linkage is proven; the temporary preflight report covers every unmatched or ambiguous user and linked-data check. |
| Business behavior | KPI filters exclude inactive assets by default; enums/types, serial uniqueness, movements, certificate links, and domain RPC outputs remain correct. |
| RPC/security | Signatures, security mode, search path, ownership, grants, and audit outcomes match the approved contract. |
| Preview | `observe` is read-only by default; `operate` requires valid company-scoped consent and signed server context; actor attribution, expiry/revocation, deny-by-default behavior, and forbidden security/admin mutations are verified. |
| Operational | Local clean replay, restore rehearsal, observability, lock/latency budget, application smoke tests, zero-reference scan for `users.company_id`, and confirmation that `rbac_compat_exceptions` is absent from the final catalog pass. |

## Temporary Compatibility Exception Lifecycle

`rbac_compat_exceptions` is migration/rehearsal-only. It must not exist in the final production schema or serve as a permanent operational ledger.

The rehearsal must produce a temporary preflight report listing every unmatched or ambiguous user, stable identifiers, reason categories, and linked business data or foreign-key dependencies. The process fails closed if a user has linked business data or an unresolved dependency.

Disposable development users may be recreated only after explicit verification confirms that they are disposable and unlinked. Otherwise, preserve the identity for manual disposition; never silently discard or recreate it. Remove the temporary exception object before production cutover and verify its absence in the final catalog.

## Rollback Strategy

Rollback is staged and stops forward writes before reversing authority. First disable canonical read/write cutover and revoke new compatibility/RPC execution where necessary; also revoke active `operate` Preview contexts and prevent new consent-scoped mutations. Restore the last known-good legacy read path, while preserving canonical rows, `rbac_memberships`, exception evidence, Preview consent/session and audit records, and the backup. The final removal of `users.company_id` is not reversed by inventing an ad hoc restoration: recovery depends on the rehearsed backup/catalog procedure and validated restoration point. If the FK swap itself must be reversed, restore the pre-migration constraint/index definitions from the captured catalog and backup under the rehearsed procedure; do not improvise reverse DDL. Do not delete canonical data automatically and do not introduce emergency dual-write. Multi-company operations unsupported by the legacy path are blocked or quarantined rather than collapsed into one default company.

## Criteria for Dropping `public.companies`

Drop is a separate approved change and requires all of the following:

- zero foreign keys, views, routines, policies, triggers, grants, jobs, generated code, and application queries reference `public.companies`;
- all business company FKs reference `public.rbac_companies` and pass validation;
- compatibility views/RPCs have no runtime calls during the observation window;
- row counts, UUID sets, required attributes, and authorization decisions reconcile with no unexplained differences;
- backup restore and rollback rehearsal are successful;
- product owners approve removal of any legacy API/contract;
- a final catalog scan and post-drop smoke test pass.

## Remaining User Decisions

1. Confirm the production target and provide a complete catalog/backup export before execution.
2. Approve the exact `rbac_companies` column contract and preservation rules for legacy attributes/timestamps.
3. Approve the `platform_admin` role identifier, bootstrap, recovery, and minimum-admin policy.
4. Approve the legacy permission-name grammar and malformed-permission quarantine policy.
5. Approve certificate/storage tenant ownership and path policy during the FK cutover.
6. Set the observation window and rollback authority for compatibility-surface retirement and dropping `public.companies`.

The Preview MVP boundary is decided: contract/schema/RLS compatibility is included now; full support UI and workflow are later. Still unresolved are the exact approved `operate` mutation allowlist, consent/request transport and retention period, preview-context role-selection rules, and the final audit retention/operational ownership policy. These must be resolved before enabling `operate`, but do not block documenting the minimum contract.

## Scope Boundary

This is a technical design and migration sequence only. It intentionally contains no executable SQL, migration file, seed change, database call, or remote deployment action.
## Local Retirement Rehearsal

Local migrations define the rehearsal functions, but `supabase/seed.sql` executes
them only after loading the synthetic legacy cohort. The final seed step invokes
`public.rbac_rehearse_retire_companies()`. It fails closed on remaining catalog or
function-source dependencies, removes rehearsal-only compatibility objects, drops
only the local `public.companies` table, and preserves canonical
`public.rbac_companies`. No migration drops the table before seed execution, and
the remote schema is unchanged.
