begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

-- This audit uses only the deterministic rows from the local legacy fixture.
select has_table('public', 'assets', 'legacy assets table exists');
select has_table('public', 'certificates', 'legacy certificates table exists');
select col_is_fk('public', 'assets', 'current_location_id', 'assets retain location ownership relationship');
select col_is_fk('public', 'assets', 'function_principle_id', 'assets retain functional principle relationship');

-- These are explicit gaps, not invented policy expectations: the current DDL
-- does not provide a tenant column or row policy for either legacy table.
select ok(exists (
  select 1 from information_schema.columns
  where table_schema = 'public' and table_name = 'assets' and column_name = 'company_id'
), 'assets have the canonical company ownership column');
select ok((select relrowsecurity from pg_class where oid = 'public.assets'::regclass),
  'assets are protected by RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.certificates'::regclass),
  'certificates are protected by RLS');
select ok(has_table_privilege('authenticated', 'public.certificates', 'SELECT'),
  'authenticated has the certificate grant required by RLS');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select is((select count(*) from storage.objects where bucket_id = 'certificates'), 0::bigint,
  'certificate Storage remains fail closed until the ownership path is verified');
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select is((select count(*) from storage.objects where bucket_id = 'certificates'), 0::bigint,
  'User B cannot read certificate Storage');
select results_eq($$update storage.objects set metadata='{"tampered":true}' where name='60000000-0000-0000-0000-000000000001' returning id$$,
  $$select null::uuid where false$$,
  'User B cannot tamper with User A certificate storage object');

select * from finish();
rollback;
