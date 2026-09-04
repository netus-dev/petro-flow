begin;
create extension if not exists pgtap with schema extensions;
select plan(16);

select has_schema('rbac_compat', 'compatibility schema exists');
select ok(to_regclass('public.companies') is null, 'retired companies table is absent from the final local schema');
select ok(exists (select 1 from pg_proc p where p.oid = to_regprocedure('public.get_asset_stats_by_functional_principle(uuid)')
  and p.proconfig @> array['search_path=""']::text[]), 'asset stats SECURITY DEFINER RPC has empty search_path');

set local role anon;
select throws_ok($$select count(*) from public.rbac_documents$$, '42501',
  'permission denied for table rbac_documents',
  'anonymous access does not expose tenant documents');
select throws_ok($$select public.rbac_has_capability(null, 'read', 'documents', null)$$,
  '42501', 'permission denied for function rbac_has_capability',
  'anonymous capability checks deny');
select is((select count(*) from storage.objects where bucket_id = 'certificates'), 0::bigint,
  'anonymous storage access denies');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"20000000-0000-0000-0000-000000000001"}', true);
select is(public.rbac_has_capability(
  '20000000-0000-0000-0000-000000000001', 'read', 'documents', 'operations'), false,
  'empty permission assignments deny by default');
select is((select count(*) from public.rbac_documents
  where company_id <> '20000000-0000-0000-0000-000000000001'), 0::bigint,
  'cross-company rows remain denied');

select is((select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects'
  and policyname in ('certificates_select_owned', 'certificates_insert_owned', 'certificates_update_owned')), 3::bigint,
  'storage policies enforce owner and certificate path joins');
select ok((select qual from pg_policies where policyname = 'certificates_select_owned')::text like '%auth.uid()%',
  'storage select policy checks owner');
select ok((select with_check from pg_policies where policyname = 'certificates_insert_owned')::text like '%storage_path%',
  'storage insert policy checks certificate path');
select ok((select with_check from pg_policies where policyname = 'certificates_update_owned')::text like '%uploaded_by%',
  'storage update policy checks certificate owner');
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select is((select count(*) from storage.objects where bucket_id = 'certificates'), 1::bigint,
  'owner can select only the matching certificate object');
select throws_ok($$insert into storage.objects (id, bucket_id, name, owner, metadata)
  values ('70000000-0000-0000-0000-000000000003', 'certificates', '60000000-0000-0000-0000-000000000002', auth.uid(), '{}'::jsonb)$$,
  '42501', 'new row violates row-level security policy for table "objects"',
  'path mismatch denies storage insert');
select throws_ok($$insert into storage.objects (id, bucket_id, name, owner, metadata)
  values ('70000000-0000-0000-0000-000000000004', 'certificates', '60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '{}'::jsonb)$$,
  '42501', 'new row violates row-level security policy for table "objects"',
  'owner mismatch denies storage insert');
select is((select count(*) from pg_views
   where schemaname = 'rbac_compat'), 0::bigint,
  'historical compatibility views are not retained in the final schema');

select * from finish();
rollback;
