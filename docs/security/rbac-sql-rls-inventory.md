# RBAC SQL and RLS Inventory

Inventory date: 2026-08-25. Source: the linked deployed Supabase catalog, read through
`pg_catalog`, `information_schema`, and `pg_policies`. This file records authorization
boundaries; it contains no production identities or tenant data.

## Deployed baseline

- Migration ledger: `20260820_seed_cameron_ultra_hoist_model`,
  `20260824122800_prod_schema`, `20260824223644_update_global_developer_access`,
  `20260824232716_add_equipment_components_grants`,
  `20260825142846_allow_developer_incidents`, and
  `20260825175217_cleanup_incidents_rls`.
- Catalog size: 66 public tables, 9 public views, 137 public functions, 250 public
  policies, and 8 storage policies. Relevant public objects are owned by `postgres`;
  `storage.objects` is owned by `supabase_storage_admin`.
- Company authority is `clients`; `companies` is a view over it. Membership is
  `user_instances -> instances.company_id`; `company_memberships` is that join as a
  view. User lifecycle is split between `users.is_active`,
  `users.membership_status`, `user_instances.is_active`, and `instances.enabled`.
- Global catalogs exist as `roles`, `permissions`, `role_permissions`, and `modules`.
  Deployed roles are Corporativo, Developer, Gerente, Operativo, and Super Admin;
  the permission catalog is empty. Assignments are instance-scoped in
  `user_instance_roles`. Module enablement is instance-scoped in `enabled_modules`.
- All listed base tables have RLS enabled. Their ACLs currently grant all table
  privileges to `anon`, `authenticated`, and `service_role`; RLS is therefore the
  only application-role boundary.

## Existing RPC and policy ownership

| Access path | Current authority | Owner / test target |
|---|---|---|
| `rigcore_is_active_company_member(company)` | `auth.uid()` plus active `user_instances`; does not check user/company lifecycle | DB owner / inactive membership and renewal |
| `rigcore_has_global_developer_access()` | Active instance role or active client membership named Developer | DB owner / deny-by-default admin test |
| `get_user_profile()` and `get_user_profile_v2()` | Identity-derived, but aggregate roles across instances and include fallback behavior | DB owner / company-scoped projection test |
| `get_user_complete_details(user)` | Caller-supplied user UUID, `SECURITY DEFINER`, executable by anon/authenticated | DB owner / cross-user tampering test |
| `modules_by_instance(rig)` | Caller-supplied rig UUID, `SECURITY DEFINER`, executable by anon/authenticated | DB owner / disabled-module and cross-company test |
| `roles`, `permissions`, `role_permissions`, `user_instances`, `user_instance_roles` | Authenticated policies use `true` for read/write | DB owner / deny-by-default mutation test |
| `clients`, `instances`, `users`, `enabled_modules` | `rigcore_can_access_client` or `rigcore_can_manage_client`; duplicate legacy select policies exist | DB owner / company A/B RLS tests |

## Storage ownership

Buckets are `acr-evidence` (public), `clients` (public), `equipments` (private),
`rigs` (public), and `users` (public). The eight `storage.objects` policies cover only
`acr-evidence` and `clients`: public read plus any-authenticated upload, update, and
delete by bucket name. They do not derive tenant ownership from `auth.uid()` or a
company path. Storage policy remediation is required before tenant-owned uploads are
approved; this work unit does not change deployed bucket behavior.

## Discrepancies and foundation decision

1. The repository had no `supabase/` baseline while the deployed migration ledger has
   six entries; local reset cannot reproduce the deployed schema from version control.
2. Existing role and module catalogs are global, but assignments and entitlements are
   instance-scoped rather than company-scoped; permissions have no action/resource
   contract and contain no rows.
3. Several authorization catalogs permit authenticated writes with `true`, and legacy
   RPCs accept caller-owned user, rig, or instance identifiers.
4. Active-company selection is not deployed as a Supabase row, revision, or
   notification. It must remain browser-session scoped. The database receives a
   request company selector and validates it against `auth.uid()`; selector input is
   never authority.
5. The migration introduces isolated `rbac_*` foundation tables so legacy production
   objects are not destructively reinterpreted before a separately approved data
   migration. It grants only document operations protected by RLS and audit reads.

## Two-company fixture and approval criteria

The pgTAP fixture creates companies A and B, one active A membership, one inactive B
membership, an inactive principal, a global editor role, read/update document
capabilities, enabled A and disabled B modules, and one document per company. It is
transactional and rolls back.

Approval requires: migration replay from a clean local stack; all 12 pgTAP assertions
green; A can read/update only A; B tampering changes no rows; inactive membership,
disabled module, unknown capability, deactivated principal, and stale renewal deny;
authenticated callers cannot mutate audit events; no `active_company*` column exists;
and production data/backfill plus storage remediation are reviewed separately.

## Policy/RPC-to-test mapping

| Policy or RPC | pgTAP assertions |
|---|---|
| `rbac_renew_authorization` | active renewal, deactivated principal, stale B context |
| `rbac_has_capability` | enabled module, disabled module, missing action, unknown resource |
| `authorization_projection` | inactive B membership returns no projection |
| `rbac_documents_select` | request-company A exposes only A |
| `rbac_documents_update` | B document tampering returns no changed row |
| audit grants and immutable trigger | authenticated update receives SQLSTATE 42501 |
| no Supabase active-company persistence | catalog contains zero tables, columns, or routines named for active company, company context, or context revision |

Verification status: approved locally on 2026-08-25. A clean isolated Supabase stack
replayed the migration, and
`supabase test db supabase/tests/rbac_multitenant_audit.pgtap.sql` passed all 12
assertions. Remote deployment and legacy data backfill remain separately gated.
