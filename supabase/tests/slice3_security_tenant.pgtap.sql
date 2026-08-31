begin;
create extension if not exists pgtap with schema extensions;
select plan(27);

-- Transaction-local Company A/B fixtures. No fixture survives this test.
insert into auth.users (id, email) values
  ('d1000000-0000-0000-0000-000000000001', 'slice3-a@example.test'),
  ('d1000000-0000-0000-0000-000000000002', 'slice3-b@example.test');
insert into public.rbac_principals (user_id, is_active) values
  ('d1000000-0000-0000-0000-000000000001', true),
  ('d1000000-0000-0000-0000-000000000002', true);
insert into public.rbac_companies (id, name, is_active) values
  ('d2000000-0000-0000-0000-000000000001', 'Slice 3 Company A', true),
  ('d2000000-0000-0000-0000-000000000002', 'Slice 3 Company B', true),
  ('d2000000-0000-0000-0000-000000000003', 'Slice 3 Inactive Company', false);
insert into public.rbac_memberships (company_id, user_id, is_active) values
  ('d2000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', true),
  ('d2000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', true),
  ('d2000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', true);
insert into public.rbac_company_modules (company_id, module_key, enabled) values
  ('d2000000-0000-0000-0000-000000000001', 'operations', true),
  ('d2000000-0000-0000-0000-000000000002', 'operations', true);
insert into public.locations (id, name, location_type, company_id) values
  ('d3000000-0000-0000-0000-000000000001', 'A location', 'operating_base', 'd2000000-0000-0000-0000-000000000001'),
  ('d3000000-0000-0000-0000-000000000002', 'B location', 'operating_base', 'd2000000-0000-0000-0000-000000000002');
insert into public.functional_principles (id, name, company_id) values
  ('d4000000-0000-0000-0000-000000000001', 'A principle', 'd2000000-0000-0000-0000-000000000001'),
  ('d4000000-0000-0000-0000-000000000002', 'B principle', 'd2000000-0000-0000-0000-000000000002');
insert into public.assets (id, company_id, current_location_id, function_principle_id) values
  ('d5000000-0000-0000-0000-000000000001', 'd2000000-0000-0000-0000-000000000001', 'd3000000-0000-0000-0000-000000000001', 'd4000000-0000-0000-0000-000000000001'),
  ('d5000000-0000-0000-0000-000000000002', 'd2000000-0000-0000-0000-000000000002', 'd3000000-0000-0000-0000-000000000002', 'd4000000-0000-0000-0000-000000000002');
insert into public.certificates (id, company_id, storage_path, uploaded_by) values
  ('d6000000-0000-0000-0000-000000000001', 'd2000000-0000-0000-0000-000000000001', 'd6000000-a.pdf', 'd1000000-0000-0000-0000-000000000001'),
  ('d6000000-0000-0000-0000-000000000002', 'd2000000-0000-0000-0000-000000000002', 'd6000000-b.pdf', 'd1000000-0000-0000-0000-000000000002');
insert into public.assets_certificates (company_id, asset_id, certificate_id) values
  ('d2000000-0000-0000-0000-000000000001', 'd5000000-0000-0000-0000-000000000001', 'd6000000-0000-0000-0000-000000000001'),
  ('d2000000-0000-0000-0000-000000000002', 'd5000000-0000-0000-0000-000000000002', 'd6000000-0000-0000-0000-000000000002');

select ok(exists (select 1 from information_schema.columns where table_schema='public' and table_name='certificates' and column_name='company_id'), 'certificates use canonical company ownership');
select ok((select count(*) from pg_constraint where conname='assets_certificates_company_id_certificate_id_fkey') = 1, 'certificate ownership uses the canonical asset relation');
select ok((select count(*) from pg_policies where schemaname='storage' and tablename='objects' and policyname like 'certificates_%') = 0, 'Storage certificate policies remain closed');
select diag('Storage ACLs are environment-managed; effective RLS/policy behavior is asserted below.');
set local role authenticated;
select is((select count(*) from storage.objects), 0::bigint, 'authenticated cannot read Storage objects');
select throws_ok($$insert into storage.objects(id, bucket_id, name, owner, metadata) values ('d7000000-0000-0000-0000-000000000001', 'certificates', 'd6000000-a.pdf', 'd1000000-0000-0000-0000-000000000001', '{}'::jsonb)$$, '42501', null, 'authenticated cannot insert Storage objects');
select results_eq($$update storage.objects set name='changed.pdf' returning id$$, $$select null::uuid where false$$, 'authenticated cannot update Storage objects');
select throws_ok($$delete from storage.objects$$, '42501', null, 'authenticated cannot delete Storage objects');
select ok(not has_function_privilege('authenticated', 'public.get_asset_stats_by_functional_principle(uuid)', 'execute'), 'authenticated cannot execute stats RPC');

select set_config('request.jwt.claim.sub', 'd1000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"d2000000-0000-0000-0000-000000000001"}', true);
select is((select count(*) from public.assets), 0::bigint, 'Company A without asset capability is denied');
select is((select count(*) from public.certificates), 0::bigint, 'Company A without certificate capability is denied');
select throws_ok($$select * from public.get_asset_stats_by_functional_principle('d4000000-0000-0000-0000-000000000001')$$, '42501', null, 'authenticated stats denial is fail closed');
select throws_ok($$insert into storage.objects(id, bucket_id, name, owner, metadata) values ('d7000000-0000-0000-0000-000000000001', 'certificates', 'd6000000-a.pdf', 'd1000000-0000-0000-0000-000000000001', '{}'::jsonb)$$, '42501', null, 'A cannot write by matching path');
select is((select count(*) from storage.objects where bucket_id='certificates' and name='d6000000-a.pdf'), 0::bigint, 'A cannot read by matching path');
select results_eq($$update storage.objects set name='d6000000-b.pdf' where bucket_id='certificates' and name='d6000000-a.pdf' returning id$$, $$select null::uuid where false$$, 'A cannot spoof B path');
select throws_ok($$delete from storage.objects where bucket_id='certificates' and name='d6000000-a.pdf'$$, '42501', null, 'A cannot delete by matching path');
select set_config('request.headers', '{}', true);
select is((select count(*) from public.assets), 0::bigint, 'missing company header denies asset reads');
select is((select count(*) from public.certificates), 0::bigint, 'missing company header denies certificate reads');
select set_config('request.headers', '{"x-company-id":"d2000000-0000-0000-0000-000000000002"}', true);
select is((select count(*) from public.assets), 0::bigint, 'A with B header cannot read B assets');
select ok(not public.rbac_renew_authorization('d2000000-0000-0000-0000-000000000002'), 'A cannot renew B authorization');
reset role;
update public.rbac_memberships set is_active=false where company_id='d2000000-0000-0000-0000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', 'd1000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"d2000000-0000-0000-0000-000000000001"}', true);
select is((select count(*) from public.assets), 0::bigint, 'inactive membership denies reads');
reset role;
update public.rbac_memberships set is_active=true where company_id='d2000000-0000-0000-0000-000000000001';
update public.rbac_principals set is_active=false where user_id='d1000000-0000-0000-0000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', 'd1000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"d2000000-0000-0000-0000-000000000001"}', true);
select is((select count(*) from public.assets), 0::bigint, 'inactive principal denies reads');
reset role;
update public.rbac_principals set is_active=true where user_id='d1000000-0000-0000-0000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', 'd1000000-0000-0000-0000-000000000002', true);
select set_config('request.headers', '{"x-company-id":"d2000000-0000-0000-0000-000000000002"}', true);
select is((select count(*) from public.assets), 0::bigint, 'Company B without capability is denied');
select set_config('request.jwt.claim.sub', 'd1000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"d2000000-0000-0000-0000-000000000003"}', true);
select is((select count(*) from public.assets), 0::bigint, 'inactive company denies reads');
reset role;
set local role anon;
select throws_ok($$select * from public.assets$$, '42501', null, 'anon cannot read assets');
select throws_ok($$select * from public.certificates$$, '42501', null, 'anon cannot read certificates');
select is((select count(*) from storage.objects), 0::bigint, 'anon cannot read Storage objects');
select throws_ok($$select * from public.get_asset_stats_by_functional_principle('d4000000-0000-0000-0000-000000000001')$$, '42501', null, 'anon cannot execute stats RPC');

select * from finish();
rollback;
