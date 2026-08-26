# Multi-Company RBAC Compatibility Specification

Status: approved design, documentation only
Scope: compatibility between the verified legacy authorization model and the local explicit multi-company RBAC model
Out of scope: database changes, remote deployment, executable backfill SQL, and environment changes

This specification preserves legacy behavior while establishing an unambiguous path to users who belong to more than one company. The key rule is that company membership is explicit; it must not be inferred only from role assignments.

## Decision Summary

| Concern | Approved decision |
|---|---|
| Multi-company users | Supported. One user may have active memberships in multiple companies. |
| `public.users.company_id` | Retained as the legacy/default company reference for compatibility. It is not the complete membership set. |
| `user_roles` | Semantics remain unchanged. It continues to assign roles to users and has no `company_id`. |
| Role scope | `roles.company_id` scopes a role to one company. |
| Explicit membership | Use `rbac_memberships(company_id, user_id, is_active)` as the membership authority in the local model. |
| Explicit assignment | Use `rbac_assignments(company_id, user_id, role_id)` for company-scoped role assignment. |
| Migration writes | No dual-write in the compatibility rollout. Reads are introduced first; writes remain on the selected legacy or new authority until cutover. |

## Verified Facts

The following facts are inputs to this design and are not proposed schema changes:

| Area | Verified fact |
|---|---|
| Legacy user record | Remote `public.users.company_id` is a single-company reference. |
| Legacy roles | `user_roles` can assign multiple roles to one user. |
| Legacy role assignment scope | `user_roles` has no `company_id`; it cannot independently express company-specific assignment. |
| Role catalog | `roles.company_id` scopes roles to a company. |
| Local membership model | `rbac_memberships` has explicit `company_id`, `user_id`, and `is_active` fields. |
| Local assignment model | `rbac_assignments` has explicit `company_id`, `user_id`, and `role_id` fields. |
| Existing local direction | The local RBAC model is namespaced and additive; compatibility must not destructively reinterpret legacy production objects. |

The verified facts do not, by themselves, define how ambiguous legacy assignments should be migrated. The rules below are therefore proposed implementation decisions.

## Compatibility Mapping

### Entity mapping

| Legacy source | Local target | Mapping rule | Authority during rollout |
|---|---|---|---|
| `public.users.id` | `user_id` in local rows | Preserve the same user identity; do not copy or recreate identities. | Legacy identity |
| `public.users.company_id` | `rbac_memberships.company_id` | Create an active membership for the legacy/default company when the source reference is valid and the user is eligible. | Explicit membership after backfill |
| `user_roles.user_id` | `rbac_assignments.user_id` | Preserve the user identifier. | Legacy read, then local read after cutover |
| `user_roles.role_id` | `rbac_assignments.role_id` | Map only when the role resolves to exactly one valid company-scoped role. | Legacy read, then local read after cutover |
| `roles.id` | `rbac_assignments.role_id` | Preserve role identity where compatible; validate its `company_id`. | Role catalog |
| `roles.company_id` | `rbac_assignments.company_id` | Use the role's company scope, never a name match or inferred company. | Explicit role scope |

### Semantic mapping

| Legacy situation | Local result |
|---|---|
| User has a valid `users.company_id` | One active membership for that company, subject to lifecycle checks. |
| User has multiple legacy `user_roles` rows | Multiple local assignments may be created, but each must resolve to a company-scoped role. |
| User is a member without a role | Keep the membership. Do not discard it because no assignment exists. |
| User has a role without an explicit membership | Do not treat the assignment as proof of membership. Quarantine or deny until membership is resolved. |
| User belongs to companies A and B | Store two active membership rows. The default field may point to one company only. |

## Invariants

These invariants must hold after the local model becomes authoritative:

1. An active authorization decision requires an active user, an active company, and an active `rbac_memberships` row for the requested company.
2. An `rbac_assignments` row must reference the same company as its role's `company_id`.
3. An assignment is usable only when the corresponding membership is active; a role does not create membership implicitly.
4. `users.company_id` may select a default or compatibility company, but authorization must never use it as the user's complete company set.
5. A user may have zero, one, or many active memberships, subject to product lifecycle rules; multiple memberships are valid, not an error.
6. Company selection is request/session context, not authority. The database or authorization boundary must validate it against active membership.
7. No role-name or company-name substring matching is permitted for migration or authorization.
8. Deactivating a membership removes authorization for that company without removing memberships or assignments for other companies.

## Backfill Rules

Backfill is a separately approved operation. This document defines behavior, not executable SQL.

1. Snapshot source counts and source-to-target reconciliation results before writing.
2. Backfill identities by stable user ID; never create duplicate users.
3. For each eligible non-null `users.company_id`, create or converge one active membership for that company.
4. For each `user_roles` row, resolve the role and its `roles.company_id`; create an assignment only when the resolution is unique and valid.
5. Do not create memberships solely because a role assignment exists.
6. Preserve existing local rows; use idempotent convergence semantics rather than destructive replacement.
7. Do not overwrite `users.company_id` during backfill. If a default must change, handle it as a separately reviewed compatibility decision.
8. Record skipped, orphaned, and ambiguous rows with stable identifiers and a reason category.
9. Backfill inactive users, companies, roles, or memberships according to their lifecycle state; do not silently promote inactive data to active authorization.

## Orphans and Ambiguity

| Condition | Required handling |
|---|---|
| User ID has no matching user | Do not create a local row. Record an orphan for investigation. |
| `users.company_id` is null | Do not invent a company or membership. Leave the user without a derived membership. |
| Company reference does not resolve | Quarantine the membership candidate and deny company-scoped access. |
| Role reference does not resolve | Quarantine the assignment candidate; do not guess from role name. |
| Role resolves but `roles.company_id` is null or invalid | Do not create an assignment; classify as an unscoped-role ambiguity. |
| Same legacy role ID maps to conflicting company scopes | Stop that row's migration and require manual resolution. |
| Role assignment has no membership | Preserve it as an orphan assignment candidate, but it grants no access. |
| Duplicate source rows | Converge to one target row where the target key is identical; report conflicting payloads. |
| Multiple possible company matches | Do not auto-select. Require an authoritative ID-based mapping. |

No ambiguity may be resolved by choosing the first row, the default company, a text similarity match, or a role-derived membership.

## Rollout

### Phase 0: Prepare and observe

- Deploy or verify the local compatibility structures independently from legacy objects.
- Produce dry-run counts and orphan/ambiguity reports.
- Validate invariants against a two-company fixture, including a user with memberships in both companies.

### Phase 1: Dual-read, no dual-write

- Read the legacy model and explicit local model separately.
- Compare normalized decisions for the same user, company, and capability request.
- Do not write both models for the same mutation. Dual-write is explicitly excluded because it can create divergent authority and makes rollback less predictable.
- Keep legacy reads as the compatibility fallback while mismatches are investigated.

### Phase 2: Controlled read cutover

- Select an authorization boundary and switch it to explicit memberships and assignments after reconciliation thresholds pass.
- Retain legacy-compatible reads for non-authoritative display paths only where required.
- Monitor denied requests, orphan counts, mismatch counts, and company-crossing attempts.

### Phase 3: Legacy retirement decision

- Only after operational evidence demonstrates parity and complete multi-company coverage, separately approve changes to legacy consumers.
- This specification does not authorize dropping, rewriting, or repurposing legacy columns or tables.

## Reconciliation Queries (Conceptual)

Implementations should provide read-only checks equivalent to the following concepts:

| Check | Expected result |
|---|---|
| Legacy users with valid `company_id` versus active local memberships | Every eligible legacy default has one matching membership. |
| Active local memberships versus user/company lifecycle | No active membership points to an inactive or missing principal/company. |
| `user_roles` joined through `roles` versus local assignments | Every uniquely resolvable legacy assignment has one matching company-scoped assignment. |
| Local assignments versus memberships | Zero usable assignments without an active same-company membership. |
| Local assignments versus role scope | Zero assignments whose `company_id` differs from `roles.company_id`. |
| Legacy and local authorization decisions by user/company/action/resource | Zero unexplained mismatches before cutover. |
| Orphan and ambiguity ledger | Every exception has a category, count, sample identifier, and disposition. |

Queries must use stable IDs and exact equality. They must not mutate data or conceal exceptions with broad joins or text matching.

## Rollback

Rollback is a read-authority change, not a destructive data reversal:

1. Disable the explicit-model read path or feature flag at the authorization boundary.
2. Restore the last known-good legacy read path for single-company-compatible behavior.
3. Preserve local memberships, assignments, and reconciliation evidence for diagnosis; do not delete them automatically.
4. Block or quarantine multi-company operations that the legacy path cannot represent rather than silently applying them to `users.company_id`.
5. Reconcile again before retrying cutover. A rollback must not introduce dual-write as an emergency workaround.

## Acceptance Criteria

- [ ] The document distinguishes verified remote/local facts from proposed implementation decisions.
- [ ] A user can belong to companies A and B through two explicit active memberships.
- [ ] `users.company_id` remains available as a legacy/default compatibility field and is never treated as the complete membership set.
- [ ] `user_roles` remains unchanged and is not treated as company-scoped data.
- [ ] Every local assignment is company-scoped and agrees with the role's `company_id`.
- [ ] Membership exists independently of role assignment; membership-only users are supported.
- [ ] Role-derived membership is rejected as an authorization rule.
- [ ] Backfill behavior is idempotent, stable-ID based, lifecycle-aware, and reports exceptions.
- [ ] Orphans and ambiguities fail closed and are recorded for resolution.
- [ ] Rollout uses dual-read comparison with no dual-write.
- [ ] Reconciliation covers membership coverage, assignment scope, orphan counts, and authorization parity.
- [ ] Rollback restores legacy reads without deleting local evidence or silently collapsing a multi-company user into one company.
- [ ] No executable SQL backfill is introduced by this work unit.
