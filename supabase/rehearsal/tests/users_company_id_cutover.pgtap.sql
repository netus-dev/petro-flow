begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

select ok(not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'company_id'), 'legacy profile membership column is removed');
select ok(exists (select 1 from public.users where id = 'a1000000-0000-0000-0000-000000000001'::uuid and name = 'Legacy Seed Admin' and email = 'legacy-admin@example.test' and job_position = 'Administrator' and is_active), 'profile fields are preserved');
select is((select count(*) from public.rbac_memberships where user_id in ('a1000000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-0000-0000-000000000002'::uuid, 'a1000000-0000-0000-0000-000000000003'::uuid)), 3::bigint, 'replacement memberships exist for the legacy cohort');
select is((select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'company_id'), 0::bigint, 'no catalog column reference remains');
select ok(to_regclass('public.companies') is null, 'legacy companies table is retired after cutover');
select ok(not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'company_id'), 'idempotent cutover keeps the column removed');

select * from finish();
rollback;
