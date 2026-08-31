# Local RBAC Consolidation Preflight

**Run date:** 2026-08-27
**Scope:** read-only inspection of the local Supabase database and repository source
**Decision:** **BLOCKED** for migration execution

## Executive Summary

The local Supabase stack is available and the identity mirror is clean: all four `public.users` IDs have exact matches in `auth.users`, with no unmatched rows. There are exactly two active users, and their emails are summarized without exposing full addresses.

The consolidation is not ready to execute. `public.companies` is empty, while `public.rbac_companies` contains two rows. UUID overlap is therefore zero. The RBAC seed data is internally populated, but its company IDs are orphaned when checked against the empty legacy `public.companies` table. No `platform_admin` role or assignment exists locally. `rbac_compat_exceptions` exists but is empty and has no catalog references detected, which supports removing it from the final production schema after migration/rehearsal evidence is retained elsewhere.

## Status Matrix

| Check | Status | Evidence |
|---|---|---|
| Supabase local status | PASS | Local development setup is running at `127.0.0.1`; Studio and database endpoints reported by `supabase status`. Several optional services are stopped: imgproxy, edge runtime, analytics, vector, and pooler. |
| `public.users` vs `auth.users` exact IDs | PASS | 4 public users, 4 auth users, 4 exact ID matches, 0 public-only, 0 auth-only. |
| Current users | PASS | 2 rows have `is_active = true`; IDs are `91000000-...0001` and `91000000-...0002`. Emails summarized as `<redacted>@example.test`. Both have null `company_id`. |
| User business-table FK dependencies | PASS with limitation | One declared FK: `public.user_roles.user_id -> public.users.id`. The query result did not expose a reliable row count for that table. No other declared public FK targets `public.users`. Non-FK references require application/catalog review. |
| `users.company_id` catalog references | PASS | 2 functions contain the reference: `public.rbac_project_legacy` and `public.handle_new_user`. 0 views, 0 policies, and 0 non-internal triggers matched. |
| `users.company_id` repository references | FAIL | Repository matches remain in authorization projection/model code, catalog presentation/infrastructure, auth/profile migration/tests, seed data, and RBAC compatibility tests. Representative paths include `src/features/authorization/domain/authorization.ts`, `src/features/catalogs/presentation/components/catalogs-content.tsx`, `src/features/catalogs/infrastructure/supabase-repository.ts`, `supabase/seed.sql`, and `supabase/migrations/20260826150000_local_auth_user_profile_trigger.sql`. |
| Companies vs RBAC companies | BLOCKED | `public.companies`: 0; `public.rbac_companies`: 2; UUID overlap: 0. RBAC IDs are `92000000-...0001` and `92000000-...0002`; legacy company table has no rows. |
| Legacy company FK coverage/orphans | BLOCKED | Declared `company_id` FKs to `public.companies` exist on `public.permissions`, `public.roles`, and `public.users`. All three legacy tables are empty of populated company IDs (`permissions` 0 rows, `roles` 0 rows, `users` 4 rows with 4 null company IDs), so there is no legacy business-row orphan to migrate. |
| RBAC company-scoped rows against legacy companies | BLOCKED | Relative to `public.companies`, orphan counts are: `rbac_assignments` 2, `rbac_company_modules` 2, `rbac_documents` 2, `rbac_memberships` 4, and `rbac_roles` 3. These are expected to be unresolved consolidation mappings while legacy companies is empty, not proof that the RBAC rows are invalid against `public.rbac_companies`. |
| Principals/memberships/assignments | PASS for seed presence | Principals 3 (2 active, 1 inactive); memberships 4 (3 active, 1 inactive); assignments 2. |
| `platform_admin` readiness | BLOCKED | 0 roles named `platform_admin`; 0 assignments using that role. |
| Permissions and action/resource candidates | PASS with migration decision required | Canonical `rbac_permissions`: 3 rows: `read.documents`, `update.documents`, `manage.access-control`. Legacy `public.permissions`: 0 rows, so there are no legacy `action.resource` candidates to convert. |
| Compatibility exceptions | PASS for removal decision | `public.rbac_compat_exceptions` exists with 0 rows, no reason groups, and no detected function/view/policy/trigger references. Safe to omit from the final schema only if migration/rehearsal tooling does not require it after this preflight. |
| Storage/certificate linkage | BLOCKED for migration completion | `public.certificates`: 4; distinct uploaders: 3; certificate paths without matching certificate-bucket object: 0; certificate-bucket objects without certificate rows: 0. 2 certificate uploaders have no matching `public.users` row. Three storage policies exist for owned certificate select/insert/update. |

## Detailed Evidence

### Identity

The four exact ID matches include two active seeded users and two inactive/development users. The local query compared UUID equality only; it did not compare email equality or expose password, token, metadata, or other secrets.

### Catalog and source references

The database catalog search found `users.company_id` in two function bodies and no matching views, policies, or non-internal trigger definitions. Repository search found the legacy field in authorization domain/projection code, catalog filtering/persistence code, profile-trigger migration and tests, seed data, and compatibility tests. This is a source cleanup/dependency-remapping requirement before removing the column from a final schema.

### Company mapping

The local database has no rows in `public.companies`, so no deterministic legacy-to-canonical UUID mapping can be inferred. The two canonical rows are:

| ID | Name | Active |
|---|---|---|
| `92000000-...0001` | Seed Company North | yes |
| `92000000-...0002` | Seed Company South | no |

### RBAC seed readiness

The principals are UUIDs `91000000-...0001`, `...0002`, and `...0003`; the third is inactive. Active memberships exist for the first two users in the North company and for the first user in the South company. Two assignments exist, both in the North company. No platform-admin bootstrap role is present.

### Storage and certificates

Certificate database rows and certificate-bucket object paths are one-to-one by path in this local dataset. However, two certificate `uploaded_by` values do not match `public.users`; this must be resolved or explicitly quarantined before user/company identity migration. Storage ownership uses Auth UUIDs and the existing policies reference certificate ownership/path checks, so any UUID repointing must preserve both `certificates.uploaded_by` and `storage.objects.owner` semantics.

## Limitations

- This was a local-only preflight; it says nothing about current remote production contents.
- No source files, database data, schema, policies, functions, or storage objects were modified.
- Email addresses were intentionally summarized by domain; no secret or credential fields were selected.
- The local catalog contains many Supabase internal tables. The business-table FK result is based on declared PostgreSQL constraints, not inferred application joins.
- The `public.user_roles` FK row-count output was not reliable in the local introspection result; rerun a focused count before migration if that table is in scope.
- “Orphan” counts for RBAC tables are specifically relative to `public.companies`; the canonical RBAC tables have their own `rbac_companies` references and were not treated as invalid canonical data.
- The repository search was textual and may include migration/test documentation that is intentionally retained as historical evidence.

## Next Recommended

1. Populate or otherwise establish the authoritative legacy-to-canonical company mapping before any FK repointing.
2. Resolve the two certificate uploaders absent from `public.users`, preserving Auth UUID and storage ownership linkage.
3. Decide and implement the initial `platform_admin` bootstrap separately; local readiness is currently absent.
4. Re-run a focused `user_roles` dependency count and a complete business-table FK inventory after the company mapping exists.
5. Keep `rbac_compat_exceptions` only in migration/rehearsal tooling if needed; omit it from the final production schema once no migration path depends on it.
