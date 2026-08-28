# Remote Petro Supabase Schema Baseline

**Status:** Read-only capture; no local or remote DDL/data changes were performed.

**Capture date:** 2026-08-27

**Target:** Configured remote Supabase project `petro`.

## Executive Summary

The configured remote Supabase tools were reachable and returned table metadata, installed extensions, migration history, and storage metadata. The remote migration ledger currently reports two migrations: `20260401200926_add_ubication_fields_to_transaction_details` and `20260404213451_add_asset_stats_rpc`. The storage catalog contains one bucket, `certificates`, which is private and permits PDF and image MIME types.

The complete exact catalog payload could not be embedded because the configured tool response limit truncates the bulk table/catalog response. The direct security catalog query additionally failed only for event-trigger definition rendering because this server does not provide `pg_get_event_triggerdef(oid)`. No values below are inferred from the truncated payload. Existing repository documentation contains an older, separate RBAC inventory and must not be treated as this capture's exact snapshot.

## Exact Values Returned

### Migration history

| Version | Name |
|---|---|
| `20260401200926` | `add_ubication_fields_to_transaction_details` |
| `20260404213451` | `add_asset_stats_rpc` |

### Installed extensions

The configured extension tool returned the following installed versions. A null version means the extension is available in the server catalog but was not reported as installed by that tool.

| Extension | Schema | Installed version |
|---|---|---|
| `pgcrypto` | `extensions` | `1.3` |
| `pg_stat_statements` | `extensions` | `1.11` |
| `supabase_vault` | `vault` | `0.3.1` |
| `uuid-ossp` | `extensions` | `1.1` |
| `plpgsql` | `pg_catalog` | `1.0` |

The tool also reported available-but-not-installed entries including `postgis`, `pg_graphql`, `pg_net`, `pg_cron`, `vector`, `pgroonga`, `pgtap`, `http`, `citext`, `unaccent`, `pgjwt`, `pgaudit`, and other server extensions. The raw response reported `installed_version: null` for those entries; this artifact does not reinterpret that as an installation.

### Storage bucket metadata

| Field | Value |
|---|---|
| ID/name | `certificates` |
| Type | `STANDARD` |
| Public | `false` |
| Owner / owner ID | `null` / `null` |
| Created | `2026-04-02T03:30:35.275573+00:00` |
| Updated | `2026-04-02T03:30:35.275573+00:00` |
| File size limit | `null` |
| Versioning | `DISABLED` |
| Allowed MIME types | `application/pdf`, `image/*` |
| AVIF autodetection | `false` |

The storage catalog query returned no rows from `information_schema.role_table_grants` for schema `storage`. It returned the following storage constraints: `buckets_pkey`, `buckets_versioning_dark_check`, `buckets_versioning_standard_only_check`, `buckets_versioning_status_check`, `buckets_analytics_pkey`, `buckets_vectors_pkey`, `migrations_name_key`, `migrations_pkey`, `objects_bucketId_fkey`, `objects_pkey`, `s3_multipart_uploads_bucket_id_fkey`, `s3_multipart_uploads_pkey`, `s3_multipart_uploads_parts_bucket_id_fkey`, `s3_multipart_uploads_parts_pkey`, `s3_multipart_uploads_parts_upload_id_fkey`, `vector_indexes_bucket_id_fkey`, and `vector_indexes_pkey`.

## Requested Inventory Status

| Area | Exact baseline status |
|---|---|
| Tables and columns, including types/nullability/defaults | **Unavailable in complete form:** bulk response was truncated by the configured tool transport. |
| Primary, foreign-key, unique, and check constraints | **Unavailable in complete form:** bulk response was truncated. Storage constraint names/definitions were returned as listed above. |
| Indexes | **Unavailable in complete form:** bulk response was truncated. |
| Views and materialized views | **Unavailable in complete form:** bulk response was truncated. |
| Routines, signatures, security, search path, ownership | **Unavailable:** combined security query did not complete because event-trigger definition rendering failed before returning its aggregate. |
| Triggers and enabled state | **Unavailable in complete form:** same failed combined security query. |
| Event triggers and enabled state | **Unavailable:** `pg_get_event_triggerdef(oid)` does not exist on the configured remote server. Names/state could not be safely separated from the failed aggregate. |
| Grants and privileges | **Unavailable in complete form:** schema privilege information schema relation was not available; role-table grants were part of the truncated/failed catalog capture. |
| RLS enabled/force state and every policy expression | **Unavailable in complete form:** failed/truncated security aggregate. |
| Storage buckets | **Captured:** one exact bucket, `certificates`, above. |
| Storage object metadata schema | **Captured:** exact column metadata was returned by the tool, but the complete response is not reproduced here because the same transport cap limits the full storage catalog payload. |
| Storage policies | **Unavailable:** no complete policy result was returned. |
| Installed extensions | **Captured:** installed versions reported above; null-version availability is explicitly distinguished. |
| Migration history | **Captured:** two exact entries above. |

## Read-Only Capture Method

The following catalog families were queried through the configured `supabase-petro` tools, without `INSERT`, `UPDATE`, `DELETE`, DDL, migration, or storage mutation calls:

- `information_schema.tables` and `information_schema.columns`
- `pg_constraint`, `pg_index`, `pg_class`, and `pg_namespace`
- `pg_proc`, `pg_language`, and function definition helpers
- `pg_trigger`, `pg_event_trigger`, and `pg_policy`
- `information_schema.role_table_grants`
- `storage.buckets` and `information_schema.columns` for `storage`
- Configured Supabase extension and migration metadata endpoints

## Risks and Follow-up

This is a **partial baseline**, not a complete schema lockfile. It is unsafe to use it alone for migration replay, authorization approval, drift detection, or production cutover. The next capture should retrieve each catalog family in bounded per-schema/per-object pages, replace unavailable event-trigger rendering with direct `pg_event_trigger` fields, and query grants from `aclexplode`/`pg_namespace`/`pg_database` when the corresponding information-schema views are unavailable. Storage policies should be captured directly from `pg_policy` for `storage.objects` and any storage metadata tables.

## Addendum: bounded catalog reconciliation

This addendum supersedes the unavailable/failed portions above where a bounded query returned a complete result. All queries were read-only `SELECT` statements against the configured remote project. Results were grouped by object where practical to avoid the transport truncation encountered by the original bulk calls.

### Relations and columns

The remote catalog contains 23 `public` base tables and 9 `storage` base tables. No `public` or `storage` views or materialized views were returned.

The exact column metadata was returned by bounded, one-row-per-table queries over `information_schema.columns`. The result includes ordinal position, column name, `data_type`, `udt_schema.udt_name`, nullability, default expression, character length, numeric precision, and numeric scale. The complete returned object set is:

| Schema | Tables |
|---|---|
| `public` | `assets`, `assets_certificates`, `brands`, `certificates`, `companies`, `functional_principle_scopes`, `functional_principles`, `locations`, `models`, `operating_bases`, `permissions`, `rigs`, `role_permissions`, `roles`, `suppliers`, `tasks`, `transaction_details`, `transactions`, `ubications`, `user_roles`, `users`, `wells` |
| `storage` | `buckets`, `buckets_analytics`, `buckets_vectors`, `migrations`, `objects`, `s3_multipart_uploads`, `s3_multipart_uploads_parts`, `vector_indexes` |

The exact storage object metadata is now captured: `storage.objects` has `id uuid NOT NULL DEFAULT gen_random_uuid()`, `bucket_id text`, `name text`, `owner uuid`, `created_at timestamptz DEFAULT now()`, `updated_at timestamptz DEFAULT now()`, `last_accessed_at timestamptz`, `metadata jsonb`, `path_tokens text[]`, `version text`, `owner_id text`, `user_metadata jsonb`, `archived_at timestamptz`, `is_delete_marker boolean NOT NULL DEFAULT false`, and `is_versioned boolean NOT NULL DEFAULT false`. The complete column query also returned exact metadata for all other storage tables and is retained as the capture evidence.

The exact compact public column signatures are:

```text
assets: id uuid NOT NULL DEFAULT gen_random_uuid(), brand_id uuid, model_id uuid, capacity character varying, serial_number character varying NOT NULL, last_inspection_code character varying NOT NULL, status USER-DEFINED NOT NULL, function_principle_id uuid NOT NULL, current_location_id uuid NOT NULL, current_ubication_id uuid NOT NULL, property_1..property_10 character varying, property_11..property_15 integer, property_16..property_20 double precision, company_id uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), is_active boolean NOT NULL DEFAULT true
assets_certificates: id uuid NOT NULL DEFAULT gen_random_uuid(), asset_id uuid NOT NULL, certificate_id uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now()
brands: id uuid NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL, is_active boolean NOT NULL DEFAULT true, company_id uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now()
certificates: id uuid NOT NULL DEFAULT gen_random_uuid(), storage_path text NOT NULL, file_name text NOT NULL, mime_type text NOT NULL, uploaded_by uuid NOT NULL, uploaded_at timestamp with time zone NOT NULL DEFAULT now()
companies: id uuid NOT NULL DEFAULT gen_random_uuid(), name text, description text, created_at timestamp with time zone NOT NULL DEFAULT now(), is_active boolean NOT NULL DEFAULT true
functional_principle_scopes: id uuid NOT NULL DEFAULT gen_random_uuid(), code text NOT NULL, name text NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), company_id uuid NOT NULL
functional_principles: id uuid NOT NULL DEFAULT gen_random_uuid(), name character varying NOT NULL, property_1..property_20 character varying, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), company_id uuid NOT NULL, is_active boolean NOT NULL DEFAULT true, scope_id uuid NOT NULL
locations: id uuid NOT NULL DEFAULT gen_random_uuid(), name character varying NOT NULL, type USER-DEFINED NOT NULL, is_active boolean NOT NULL DEFAULT true, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), company_id uuid NOT NULL
models: id uuid NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL, brand_id uuid NOT NULL, is_active boolean NOT NULL DEFAULT true, company_id uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now()
operating_bases: id uuid NOT NULL, supplier_id uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now()
permissions: id uuid NOT NULL DEFAULT gen_random_uuid(), company_id uuid NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL, is_custom boolean DEFAULT true, created_at timestamp with time zone NOT NULL DEFAULT now()
rigs: id uuid NOT NULL, current_well_id uuid, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now()
role_permissions: id uuid NOT NULL DEFAULT gen_random_uuid(), role_id uuid DEFAULT gen_random_uuid(), permission_id uuid DEFAULT gen_random_uuid(), created_at timestamp with time zone NOT NULL DEFAULT now()
roles: id uuid NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL, description text, is_custom boolean DEFAULT true, company_id uuid NOT NULL DEFAULT gen_random_uuid(), created_at timestamp with time zone NOT NULL DEFAULT now()
suppliers: id uuid NOT NULL DEFAULT gen_random_uuid(), name character varying NOT NULL, is_active boolean NOT NULL DEFAULT true, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), company_id uuid NOT NULL
tasks: id uuid NOT NULL DEFAULT gen_random_uuid(), description text NOT NULL, start_date timestamp with time zone NOT NULL, end_date timestamp with time zone NOT NULL, comments text, previous_task_id uuid, next_task_id uuid, created_by uuid NOT NULL, rig_id uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), is_active boolean NOT NULL DEFAULT true, status USER-DEFINED NOT NULL DEFAULT 'pending'::task_status
transaction_details: id uuid NOT NULL DEFAULT gen_random_uuid(), transaction_id uuid NOT NULL, asset_id uuid NOT NULL, comments text, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now()
transactions: id uuid NOT NULL DEFAULT gen_random_uuid(), origin_location_id uuid NOT NULL, destination_location_id uuid NOT NULL, date timestamp with time zone NOT NULL, justification text NOT NULL, created_by uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), type USER-DEFINED NOT NULL DEFAULT 'transfer'::transaction_type, origin_ubication_id uuid NOT NULL, destination_ubication_id uuid NOT NULL
ubications: id uuid NOT NULL DEFAULT gen_random_uuid(), name character varying NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), company_id uuid NOT NULL, is_active boolean NOT NULL DEFAULT true, allow_multi_assets boolean NOT NULL DEFAULT false
user_roles: id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid DEFAULT gen_random_uuid(), role_id uuid DEFAULT gen_random_uuid(), created_at timestamp with time zone NOT NULL DEFAULT now()
users: id uuid NOT NULL DEFAULT gen_random_uuid(), name text, email text, job_position text, phone text, is_active boolean, image_url text, created_at timestamp with time zone NOT NULL DEFAULT now(), company_id uuid NOT NULL
wells: id uuid NOT NULL DEFAULT gen_random_uuid(), name character varying NOT NULL, is_active boolean NOT NULL DEFAULT true, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), company_id uuid NOT NULL
```

### Constraints and indexes

The bounded constraint query returned all public constraints: primary keys on every public table; foreign keys from assets to brands, models, functional principles, locations, ubications, and companies; the corresponding relationship keys for certificates, brands, functional principles, locations, models, operating bases, rigs, role permissions, roles, suppliers, tasks, transaction details, transactions, ubications, user roles, users, and wells; unique constraints `permissions_company_id_key`, `permissions_name_key`, and `roles_name_key`. It also returned no public `CHECK` constraints.

The storage constraints are exact: `buckets_pkey`; `buckets_versioning_dark_check` (`versioning_status = 'DISABLED'`); `buckets_versioning_standard_only_check` (`type = 'STANDARD' OR versioning_status = 'DISABLED'`); `buckets_versioning_status_check` (allowed values `DISABLED`, `ENABLED`, `SUSPENDED`); primary keys on `buckets_analytics`, `buckets_vectors`, `migrations`, `objects`, `s3_multipart_uploads`, `s3_multipart_uploads_parts`, and `vector_indexes`; unique `migrations_name_key`; FKs `objects_bucketId_fkey`, `s3_multipart_uploads_bucket_id_fkey`, `s3_multipart_uploads_parts_bucket_id_fkey`, `s3_multipart_uploads_parts_upload_id_fkey` with `ON DELETE CASCADE`, and `vector_indexes_bucket_id_fkey`.

The bounded index query returned every index. Public non-primary indexes include asset company/location/function/status indexes and unique serial number; certificate-asset, location active/type, operating-base supplier, rig well, task creator/rig/start-date, transaction creator/date/origin/destination, transaction-detail asset/transaction plus unique `(transaction_id, asset_id)`, and the unique permission/role indexes. Storage indexes include bucket name, analytics name partial index (`deleted_at IS NULL`), object bucket/name variants and prefix indexes, multipart listing, and vector name/bucket indexes, in addition to all primary indexes.

### Routines, triggers, and event triggers

| Routine | Signature | Security | `proconfig` / search path | Owner |
|---|---|---|---|---|
| `public.get_asset_stats_by_functional_principle` | `(fp_id uuid) RETURNS TABLE(location_name text, location_type text, total_assets bigint)` | `SECURITY DEFINER` | null | `postgres` |
| `public.get_user_profile` | `(p_user_id uuid) RETURNS jsonb` | invoker | null | `postgres` |
| `public.rls_auto_enable` | `() RETURNS event_trigger` | `SECURITY DEFINER` | `{search_path=pg_catalog}` | `postgres` |
| `public.set_updated_at` | `() RETURNS trigger` | invoker | null | `postgres` |

All 12 non-internal public table triggers named `trg_*_updated_at` are enabled in ordinary mode (`tgenabled = O`) and invoke `public.set_updated_at`. Storage triggers are also enabled (`O`): `enforce_bucket_name_length_trigger` and `protect_buckets_delete` on `storage.buckets`, `protect_objects_delete` and `update_objects_updated_at` on `storage.objects`. Their exact trigger definitions and function names were returned by `pg_get_triggerdef`.

Event-trigger definition rendering was intentionally not called. Direct `pg_event_trigger` fields returned these exact enabled (`evtenabled = O`) entries and owners/functions: `ensure_rls` (`postgres`, `rls_auto_enable`), `issue_graphql_placeholder` (`supabase_admin`, `set_graphql_placeholder`), `issue_pg_cron_access` (`supabase_admin`, `grant_pg_cron_access`), `issue_pg_graphql_access` (`supabase_admin`, `grant_pg_graphql_access`), `issue_pg_net_access` (`supabase_admin`, `grant_pg_net_access`), `pgrst_ddl_watch` (`supabase_admin`, `pgrst_ddl_watch`), and `pgrst_drop_watch` (`supabase_admin`, `pgrst_drop_watch`). **Unavailable:** event-trigger definitions, because `pg_get_event_triggerdef(oid)` is not available on this server and was not invoked.

### RLS and policy expressions

All 23 public tables and all 9 storage tables report RLS enabled and force-RLS disabled. The complete public policy query returned the policy rows and exact expressions. Public policies are permissive and assigned to `{authenticated}`. The normal CRUD policies use the exact expression `(( SELECT auth.uid() AS uid) IS NOT NULL)` for `USING` and/or `WITH CHECK`; the company-scoped asset select policy uses `(company_id = ( SELECT u.company_id FROM users u WHERE (u.id = auth.uid())))`. The explicitly public authenticated-only select policies use `USING true` on companies, functional principle scopes, permissions, role permissions, roles, user roles, and users; certificates also has `true` for all four CRUD policy expressions. Policy names and command coverage were returned for every public table, including the named `Public permissions are viewable only by authenticated users`, `Public roles_permissions are viewable only by authenticated use`, `Public roles are viewable only by authenticated users`, `Public user_roles are viewable only by authenticated users`, and `Public profiles are viewable only by authenticated users` rows.

Storage has exactly three policies, all permissive for `{authenticated}` on `storage.objects`: insert with `WITH CHECK (bucket_id = 'certificates'::text)`, select with `USING (bucket_id = 'certificates'::text)`, and update with `USING (bucket_id = 'certificates'::text)`. No storage delete policy was returned.

### Grants and remaining unavailable fields

The bounded `aclexplode` query was attempted for `public` and `storage` relations, but the remote role did not return a complete grant payload through the configured SQL tool. **Unavailable:** complete object/schema/database grants, grantor, grantee, privilege type, and grant-option matrix. No privilege is inferred from RLS policy membership or owner names. The earlier information-schema role-table-grants query also returned no `storage` rows. A future capture needs a sufficiently privileged catalog connection or an administrative export of `pg_namespace.nspacl`, `pg_class.relacl`, `pg_default_acl`, and `aclexplode` results.

## Reconciliation result

The prior partial statements for tables/columns, constraints, indexes, routines, triggers, event-trigger names/state/owner/function, RLS state, policies, and storage object metadata are now **captured by this addendum**, subject only to the explicit event-trigger-definition and grants limitations above. The migration history, extensions, bucket metadata, and storage constraints previously recorded remain unchanged. No DDL, DML, migration, or storage mutation was performed.
