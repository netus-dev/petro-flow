begin;
create extension if not exists pgtap with schema extensions;
select plan(43);

-- Deterministic, transaction-local fixtures. No legacy row is assigned an owner.
insert into auth.users (id, email) values
  ('c1000000-0000-0000-0000-000000000001', 'tenant-fixture-a@example.test'),
  ('c1000000-0000-0000-0000-000000000002', 'tenant-fixture-b@example.test');
insert into public.rbac_companies (id, name, is_active) values
  ('c2000000-0000-0000-0000-000000000001', 'Tenant Fixture Company A', true),
  ('c2000000-0000-0000-0000-000000000002', 'Tenant Fixture Company B', true);
insert into public.rbac_principals (user_id, is_active) values
  ('c1000000-0000-0000-0000-000000000001', true),
  ('c1000000-0000-0000-0000-000000000002', true);
insert into public.rbac_memberships (company_id, user_id, is_active) values
  ('c2000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', true),
  ('c2000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', true);
insert into public.rbac_roles (id, company_id, name) values
  ('c3000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'tenant-fixture-role-a'),
  ('c3000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002', 'tenant-fixture-role-b');
insert into public.rbac_permissions (id, action, resource) values
  ('c4000000-0000-0000-0000-000000000001', 'read', 'catalogs'),
  ('c4000000-0000-0000-0000-000000000002', 'read', 'assets'),
  ('c4000000-0000-0000-0000-000000000003', 'update', 'assets'),
  ('c4000000-0000-0000-0000-000000000004', 'delete', 'assets'),
  ('c4000000-0000-0000-0000-000000000005', 'create', 'assets'),
  ('c4000000-0000-0000-0000-000000000006', 'read', 'certificates');
insert into public.rbac_role_permissions (role_id, permission_id)
select r.role_id, p.permission_id
from (values
  ('c3000000-0000-0000-0000-000000000001'::uuid),
  ('c3000000-0000-0000-0000-000000000002'::uuid)
) r(role_id)
cross join (values
  ('c4000000-0000-0000-0000-000000000001'::uuid),
  ('c4000000-0000-0000-0000-000000000002'::uuid),
  ('c4000000-0000-0000-0000-000000000003'::uuid),
  ('c4000000-0000-0000-0000-000000000004'::uuid),
  ('c4000000-0000-0000-0000-000000000005'::uuid),
  ('c4000000-0000-0000-0000-000000000006'::uuid)
) p(permission_id);
insert into public.rbac_assignments (company_id, user_id, role_id) values
  ('c2000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001'),
  ('c2000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000002');
insert into public.rbac_company_modules (company_id, module_key, enabled) values
  ('c2000000-0000-0000-0000-000000000001', 'operations', true),
  ('c2000000-0000-0000-0000-000000000002', 'operations', true);

-- Catalog columns are limited to the verified migration columns and real FKs.
insert into public.brands (id, name, company_id) values
  ('c5000000-0000-0000-0000-000000000001', 'A brand', 'c2000000-0000-0000-0000-000000000001'),
  ('c5000000-0000-0000-0000-000000000002', 'B brand', 'c2000000-0000-0000-0000-000000000002');
insert into public.models (id, name, brand_id, company_id) values
  ('c5100000-0000-0000-0000-000000000001', 'A model', 'c5000000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001'),
  ('c5100000-0000-0000-0000-000000000002', 'B model', 'c5000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002');
insert into public.suppliers (id, name, company_id) values
  ('c5200000-0000-0000-0000-000000000001', 'A supplier', 'c2000000-0000-0000-0000-000000000001'),
  ('c5200000-0000-0000-0000-000000000002', 'B supplier', 'c2000000-0000-0000-0000-000000000002');
insert into public.wells (id, name, company_id) values
  ('c5300000-0000-0000-0000-000000000001', 'A well', 'c2000000-0000-0000-0000-000000000001'),
  ('c5300000-0000-0000-0000-000000000002', 'B well', 'c2000000-0000-0000-0000-000000000002');
insert into public.locations (id, name, location_type, company_id) values
  ('c5400000-0000-0000-0000-000000000001', 'A location', 'operating_base', 'c2000000-0000-0000-0000-000000000001'),
  ('c5400000-0000-0000-0000-000000000002', 'B location', 'operating_base', 'c2000000-0000-0000-0000-000000000002');
insert into public.operating_bases (id, supplier_id) values
  ('c5400000-0000-0000-0000-000000000001', 'c5200000-0000-0000-0000-000000000001'),
  ('c5400000-0000-0000-0000-000000000002', 'c5200000-0000-0000-0000-000000000002');
insert into public.functional_principles (id, name, company_id) values
  ('c5500000-0000-0000-0000-000000000001', 'A principle', 'c2000000-0000-0000-0000-000000000001'),
  ('c5500000-0000-0000-0000-000000000002', 'B principle', 'c2000000-0000-0000-0000-000000000002');
insert into public.ubications (id, name, company_id) values
  ('c5600000-0000-0000-0000-000000000001', 'A ubication', 'c2000000-0000-0000-0000-000000000001'),
  ('c5600000-0000-0000-0000-000000000002', 'B ubication', 'c2000000-0000-0000-0000-000000000002');
insert into public.assets (id, company_id, current_location_id, function_principle_id) values
  ('c5700000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'c5400000-0000-0000-0000-000000000001', 'c5500000-0000-0000-0000-000000000001'),
  ('c5700000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002', 'c5400000-0000-0000-0000-000000000002', 'c5500000-0000-0000-0000-000000000002');
insert into public.certificates (id, company_id, storage_path, uploaded_by) values
  ('c5800000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001', 'tenant-fixture-a.pdf', 'c1000000-0000-0000-0000-000000000001'),
  ('c5800000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002', 'tenant-fixture-b.pdf', 'c1000000-0000-0000-0000-000000000002');
insert into public.assets_certificates (company_id, asset_id, certificate_id) values
  ('c2000000-0000-0000-0000-000000000001', 'c5700000-0000-0000-0000-000000000001', 'c5800000-0000-0000-0000-000000000001'),
  ('c2000000-0000-0000-0000-000000000002', 'c5700000-0000-0000-0000-000000000002', 'c5800000-0000-0000-0000-000000000002');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'c1000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"c2000000-0000-0000-0000-000000000001"}', true);
select ok(public.rbac_renew_authorization('c2000000-0000-0000-0000-000000000001'), 'User A renews Company A');
select is((select count(*) from public.brands), 1::bigint, 'A sees only A brands');
select is((select count(*) from public.models), 1::bigint, 'A sees only A models');
select is((select count(*) from public.suppliers), 1::bigint, 'A sees only A suppliers');
select is((select count(*) from public.wells), 1::bigint, 'A sees only A wells');
select is((select count(*) from public.locations), 1::bigint, 'A sees only A locations');
select is((select count(*) from public.functional_principles), 1::bigint, 'A sees only A principles');
select is((select count(*) from public.ubications), 1::bigint, 'A sees only A ubications');
select is((select count(*) from public.assets), 1::bigint, 'A sees only A assets');
select is((select count(*) from public.assets_certificates ac join public.certificates c on c.id = ac.certificate_id and c.company_id = ac.company_id), 1::bigint, 'A sees only A certificate links');
select results_eq($$select name from public.brands$$, $$values ('A brand'::text)$$, 'A visible catalog row has the expected identity and name');
select results_eq($$select company_id from public.brands$$, $$values ('c2000000-0000-0000-0000-000000000001'::uuid)$$, 'A visible catalog row has the expected tenant scope');
select results_eq($$select id, company_id from public.assets$$, $$values ('c5700000-0000-0000-0000-000000000001'::uuid, 'c2000000-0000-0000-0000-000000000001'::uuid)$$, 'A visible asset has the expected identity and tenant scope');
select results_eq($$select c.storage_path from public.assets_certificates ac join public.certificates c on c.id = ac.certificate_id and c.company_id = ac.company_id$$, $$values ('tenant-fixture-a.pdf'::text)$$, 'A visible certificate link has the expected identity and name');
select is((select count(*) from public.assets where id = 'c5700000-0000-0000-0000-000000000002'), 0::bigint, 'A direct B asset lookup is hidden');
select throws_ok($$update public.assets set company_id='c2000000-0000-0000-0000-000000000002' where id='c5700000-0000-0000-0000-000000000001'$$, '42501', null, 'A company spoof is rejected');
select results_eq($$delete from public.assets where id='c5700000-0000-0000-0000-000000000002' returning id$$, $$select null::uuid where false$$, 'A cannot delete B asset');
select throws_ok($$insert into public.assets (id, company_id, current_location_id, function_principle_id) values ('c5700000-0000-0000-0000-000000000003','c2000000-0000-0000-0000-000000000002','c5400000-0000-0000-0000-000000000002','c5500000-0000-0000-0000-000000000002')$$, '42501', null, 'A cannot insert B asset');
select throws_ok($$insert into public.assets (id, company_id, current_location_id, function_principle_id) values ('c5700000-0000-0000-0000-000000000004','c2000000-0000-0000-0000-000000000001','c5400000-0000-0000-0000-000000000002','c5500000-0000-0000-0000-000000000001')$$, null, null, 'asset location company mismatch is rejected');
select throws_ok($$insert into public.assets (id, company_id, current_location_id, function_principle_id) values ('c5700000-0000-0000-0000-000000000005','c2000000-0000-0000-0000-000000000001','c5400000-0000-0000-0000-000000000001','c5500000-0000-0000-0000-000000000002')$$, null, null, 'asset principle company mismatch is rejected');
select is((select count(*) from storage.objects where bucket_id='certificates'), 0::bigint, 'Storage remains fail closed');
select throws_ok($$insert into storage.objects(id, bucket_id, name, owner, metadata) values ('c5900000-0000-0000-0000-000000000001', 'certificates', 'tenant-fixture-a.pdf', 'c1000000-0000-0000-0000-000000000001', '{}'::jsonb)$$, '42501', null, 'authenticated cannot insert certificate Storage object');
select results_eq($$update storage.objects set metadata='{"tampered":true}' where name='tenant-fixture-a.pdf' returning id$$, $$select null::uuid where false$$, 'authenticated cannot update certificate Storage object');
select throws_ok($$delete from storage.objects where name='tenant-fixture-a.pdf'$$, '42501', null, 'authenticated cannot delete certificate Storage object');

select set_config('request.headers', '{}', true);
select is((select count(*) from public.assets), 0::bigint, 'authenticated without company header sees no assets');
select is((select count(*) from public.assets where id = 'c5700000-0000-0000-0000-000000000001'), 0::bigint, 'authenticated without company header cannot read an asset by ID');

select set_config('request.jwt.claim.sub', 'c1000000-0000-0000-0000-000000000002', true);
select set_config('request.headers', '{"x-company-id":"c2000000-0000-0000-0000-000000000002"}', true);
select ok(public.rbac_renew_authorization('c2000000-0000-0000-0000-000000000002'), 'User B renews Company B');
select is((select count(*) from public.brands), 1::bigint, 'B sees only B brands');
select is((select count(*) from public.assets), 1::bigint, 'B sees only B assets');
select results_eq($$select name from public.brands$$, $$values ('B brand'::text)$$, 'B visible catalog row has the expected identity and name');
select results_eq($$select company_id from public.brands$$, $$values ('c2000000-0000-0000-0000-000000000002'::uuid)$$, 'B visible catalog row has the expected tenant scope');
select results_eq($$select id, company_id from public.assets$$, $$values ('c5700000-0000-0000-0000-000000000002'::uuid, 'c2000000-0000-0000-0000-000000000002'::uuid)$$, 'B visible asset has the expected identity and tenant scope');
select results_eq($$select c.storage_path from public.assets_certificates ac join public.certificates c on c.id = ac.certificate_id and c.company_id = ac.company_id$$, $$values ('tenant-fixture-b.pdf'::text)$$, 'B visible certificate link has the expected identity and name');
select is((select count(*) from public.assets where id = 'c5700000-0000-0000-0000-000000000001'), 0::bigint, 'B cannot see A asset');
select results_eq($$update public.assets set is_active=false where id='c5700000-0000-0000-0000-000000000001' returning id$$, $$select null::uuid where false$$, 'B cannot update A asset');

select set_config('request.jwt.claim.sub', 'c1000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"c2000000-0000-0000-0000-000000000002"}', true);
select is((select count(*) from public.assets), 0::bigint, 'A with B header sees no rows');
select ok(not public.rbac_renew_authorization('c2000000-0000-0000-0000-000000000002'), 'A with B header cannot renew');

reset role;
set local role anon;
select throws_ok($$select * from public.assets$$, '42501', null, 'anon cannot read assets');
select throws_ok($$select * from public.brands$$, '42501', null, 'anon cannot read catalogs');
select throws_ok($$select * from public.certificates$$, '42501', null, 'anon cannot read certificates');
select throws_ok($$insert into storage.objects(id, bucket_id, name, owner, metadata) values ('c5900000-0000-0000-0000-000000000002', 'certificates', 'tenant-fixture-a.pdf', 'c1000000-0000-0000-0000-000000000001', '{}'::jsonb)$$, '42501', null, 'anon cannot insert certificate Storage object');
select results_eq($$update storage.objects set metadata='{"tampered":true}' where name='tenant-fixture-a.pdf' returning id$$, $$select null::uuid where false$$, 'anon cannot update certificate Storage object');
select throws_ok($$delete from storage.objects where name='tenant-fixture-a.pdf'$$, '42501', null, 'anon cannot delete certificate Storage object');

select * from finish();
rollback;
