begin;
create extension if not exists pgtap with schema extensions;
select plan(21);

select is((select count(*) from public.rbac_companies where id in
  ('a2000000-0000-0000-0000-000000000001'::uuid, 'a2000000-0000-0000-0000-000000000002'::uuid)), 2::bigint,
  'legacy company IDs are preserved exactly');
select is((select count(*) from public.rbac_companies where id in
  ('a2000000-0000-0000-0000-000000000001'::uuid, 'a2000000-0000-0000-0000-000000000002'::uuid)), 2::bigint,
  'synthetic legacy company identities do not duplicate');
select is((select count(*) from public.rbac_companies where id in
  ('92000000-0000-0000-0000-000000000001'::uuid, '92000000-0000-0000-0000-000000000002'::uuid)), 2::bigint,
  'unrelated canonical seed companies are preserved');
select is((select count(*) from public.rbac_principals p join auth.users a on a.id = p.user_id), (select count(*) from public.users u join auth.users a on a.id = u.id), 'principals are auth-linked exactly');
select ok(exists (select 1 from public.rbac_memberships where user_id = 'a1000000-0000-0000-0000-000000000002'::uuid), 'membership does not depend on a role');
select is((select count(*) from public.rbac_roles where company_id = 'a2000000-0000-0000-0000-000000000001'::uuid), 1::bigint, 'roles retain company scope');
select is((select count(*) from public.rbac_assignments where company_id = 'a2000000-0000-0000-0000-000000000001'::uuid), 1::bigint, 'unambiguous role join is assigned in scope');
select ok(not public.rbac_has_capability('a2000000-0000-0000-0000-000000000002'::uuid, 'read', 'legacy-documents', null), 'inactive membership fails closed');
select is((select count(*) from public.rbac_permissions where action = 'read' and resource = 'legacy-documents'), 1::bigint, 'valid action.resource permission is mapped once');
select ok(to_regclass('public.rbac_compat_exceptions') is null, 'compatibility exceptions are not retained');
select ok(to_regclass('public.rbac_compat_reconciliation') is null, 'persistent reconciliation view is not retained');
select is((select count(*) from public.certificates c join storage.objects o on o.name = c.storage_path and o.bucket_id = 'certificates' and o.owner = c.uploaded_by where c.id = 'a5000000-0000-0000-0000-000000000001'::uuid), 1::bigint, 'certificate ownership validation identifies valid ownership');
-- The migration-only rehearsal helpers are intentionally removed by final retirement.
select is((select count(*) from public.rbac_memberships where company_id = 'a2000000-0000-0000-0000-000000000001'::uuid), 2::bigint, 'rerun does not duplicate memberships');
select ok(not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'company_id'), 'users company field is cut over to memberships');
select ok(exists (select 1 from pg_constraint c join pg_class t on t.oid = c.conrelid join pg_class p on p.oid = c.confrelid where t.relname = 'roles' and p.relname = 'rbac_companies' and c.conname = 'fk_roles_company_id_rbac_companies'), 'roles company FK targets canonical companies');
select throws_ok($$insert into public.roles (name, company_id) values ('invalid-rehearsal-role', 'ffffffff-ffff-ffff-ffff-ffffffffffff')$$, '23503', null, 'invalid canonical company is rejected');
select is((select count(*) from public.users where id in
  ('a1000000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-0000-0000-000000000002'::uuid, 'a1000000-0000-0000-0000-000000000003'::uuid)), 3::bigint, 'synthetic legacy profile data remains intact');
select is((select count(*) from pg_constraint c join pg_class t on t.oid = c.conrelid join pg_class p on p.oid = c.confrelid where t.relname in ('users','roles','permissions') and p.relname = 'rbac_companies'), 2::bigint, 'remaining legacy company FKs are repointed');
select ok(to_regclass('public.companies') is null and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'company_id'), 'legacy table and profile membership field are retired');
select is((select count(*) from pg_constraint c where c.conname = 'fk_users_company_id_rbac_companies'), 0::bigint, 'users company FK is removed with the legacy field');
select is((select pg_get_constraintdef(c.oid) from pg_constraint c where c.conname = 'fk_roles_company_id_rbac_companies'), 'FOREIGN KEY (company_id) REFERENCES rbac_companies(id) ON DELETE CASCADE', 'roles FK preserves delete action');
select * from finish();
rollback;
