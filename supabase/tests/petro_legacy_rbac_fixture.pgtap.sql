begin;
create extension if not exists pgtap with schema extensions;
select plan(19);

select is((select count(*) from information_schema.tables where table_schema = 'public' and table_name in
  ('companies', 'users', 'roles', 'permissions', 'user_roles', 'role_permissions')), 6::bigint,
  'verified legacy RBAC tables exist locally');
select ok((select relrowsecurity from pg_class where oid = 'public.companies'::regclass), 'companies RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.users'::regclass), 'users RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.roles'::regclass), 'roles RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.permissions'::regclass), 'permissions RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.user_roles'::regclass), 'user_roles RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.role_permissions'::regclass), 'role_permissions RLS enabled');

select is((select count(*) from pg_policies where schemaname = 'public' and policyname like 'legacy_%_authenticated_crud'), 0::bigint,
  'unsafe authenticated CRUD baseline has been removed');
select is((select count(*) from information_schema.role_table_grants where grantee = 'authenticated' and table_schema = 'public' and table_name in
  ('companies', 'users', 'roles', 'permissions', 'user_roles', 'role_permissions') and privilege_type in ('INSERT', 'UPDATE', 'DELETE')), 0::bigint,
  'authenticated mutations are revoked');

select is((select public = false from storage.buckets where id = 'certificates'), true, 'certificates bucket is private');
select is((select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'legacy_certificates_%'), 0::bigint,
  'unsafe bucket-only storage policies have been removed');
select ok(to_regprocedure('public.get_asset_stats_by_functional_principle(uuid)') is not null,
  'verified asset stats RPC exists');
select is((select provolatile from pg_proc where oid = to_regprocedure('public.get_asset_stats_by_functional_principle(uuid)')), 'v',
  'asset stats RPC is volatile');
select is((select proconfig from pg_proc where oid = to_regprocedure('public.get_asset_stats_by_functional_principle(uuid)')),
  array['search_path=""']::text[], 'asset stats RPC has empty search_path');
select is((select count(*) from public.get_asset_stats_by_functional_principle('40000000-0000-0000-0000-000000000001')), 2::bigint,
  'asset stats excludes inactive assets and groups by location');

select is((select count(*) from pg_constraint where conrelid = 'public.users'::regclass and contype = 'f'), 2::bigint,
  'users keeps auth and company foreign keys');
select ok(exists (select 1 from pg_constraint where conrelid = 'public.permissions'::regclass and contype = 'u'),
  'permissions has a unique company constraint');
select ok(exists (select 1 from pg_constraint where conrelid = 'public.roles'::regclass and contype = 'u'),
  'roles has a unique name constraint');
select ok(exists (select 1 from pg_constraint where conrelid = 'public.permissions'::regclass and contype = 'u'),
  'permissions uniqueness constraints are present');

select * from finish();
rollback;
