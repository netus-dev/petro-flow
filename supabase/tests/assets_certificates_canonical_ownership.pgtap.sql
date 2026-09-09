begin;
create extension if not exists pgtap with schema extensions;
select plan(18);

insert into auth.users (id, email) values
  ('e1000000-0000-0000-0000-000000000001', 'slice2-a@example.test'),
  ('e1000000-0000-0000-0000-000000000002', 'slice2-b@example.test')
on conflict (id) do nothing;
insert into public.rbac_principals (user_id, is_active) values
  ('e1000000-0000-0000-0000-000000000001', true),
  ('e1000000-0000-0000-0000-000000000002', true)
on conflict (user_id) do update set is_active = excluded.is_active;
insert into public.rbac_companies (id, name, is_active) values
  ('e2000000-0000-0000-0000-000000000001', 'Slice 2 Company A', true),
  ('e2000000-0000-0000-0000-000000000002', 'Slice 2 Company B', true),
  ('e2000000-0000-0000-0000-000000000003', 'Slice 2 Inactive', false)
on conflict (id) do update set is_active = excluded.is_active;
insert into public.rbac_memberships (company_id, user_id, is_active) values
  ('e2000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', true),
  ('e2000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', true),
  ('e2000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001', true)
on conflict (company_id, user_id) do update set is_active = excluded.is_active;

insert into public.locations (id, name, type, company_id) values
  ('e3000000-0000-0000-0000-000000000001', 'A location', 'operating_base', 'e2000000-0000-0000-0000-000000000001'),
  ('e3000000-0000-0000-0000-000000000002', 'B location', 'operating_base', 'e2000000-0000-0000-0000-000000000002')
on conflict (id) do update set company_id = excluded.company_id;
insert into public.functional_principles (id, name, company_id) values
  ('e4000000-0000-0000-0000-000000000001', 'A principle', 'e2000000-0000-0000-0000-000000000001'),
  ('e4000000-0000-0000-0000-000000000002', 'B principle', 'e2000000-0000-0000-0000-000000000002')
on conflict (id) do update set company_id = excluded.company_id;
insert into public.assets (id, company_id, current_location_id, function_principle_id) values
  ('e5000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001', 'e3000000-0000-0000-0000-000000000001', 'e4000000-0000-0000-0000-000000000001'),
  ('e5000000-0000-0000-0000-000000000002', 'e2000000-0000-0000-0000-000000000002', 'e3000000-0000-0000-0000-000000000002', 'e4000000-0000-0000-0000-000000000002')
on conflict (id) do update set company_id = excluded.company_id;
insert into public.certificates (id, company_id, storage_path, uploaded_by) values
  ('e6000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001', 'slice2-a.pdf', 'e1000000-0000-0000-0000-000000000001'),
  ('e6000000-0000-0000-0000-000000000002', 'e2000000-0000-0000-0000-000000000002', 'slice2-b.pdf', 'e1000000-0000-0000-0000-000000000002')
on conflict (id) do update set company_id = excluded.company_id, storage_path = excluded.storage_path, uploaded_by = excluded.uploaded_by;
insert into public.assets_certificates (company_id, asset_id, certificate_id) values
  ('e2000000-0000-0000-0000-000000000001', 'e5000000-0000-0000-0000-000000000001', 'e6000000-0000-0000-0000-000000000001'),
  ('e2000000-0000-0000-0000-000000000002', 'e5000000-0000-0000-0000-000000000002', 'e6000000-0000-0000-0000-000000000002');

-- A role receives the reviewed asset/certificate capabilities only for its company.
insert into public.rbac_roles (id, company_id, name) values
  ('e7000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001', 'Slice 2 operator A'),
  ('e7000000-0000-0000-0000-000000000002', 'e2000000-0000-0000-0000-000000000002', 'Slice 2 operator B')
on conflict (id) do nothing;
insert into public.rbac_permissions (id, action, resource) values
  ('e8000000-0000-0000-0000-000000000001', 'read', 'assets'),
  ('e8000000-0000-0000-0000-000000000002', 'read', 'certificates'),
  ('e8000000-0000-0000-0000-000000000003', 'update', 'assets'),
  ('e8000000-0000-0000-0000-000000000004', 'delete', 'assets')
on conflict (action, resource) do nothing;
insert into public.rbac_role_permissions (role_id, permission_id)
select 'e7000000-0000-0000-0000-000000000001'::uuid, p.id
from public.rbac_permissions p
where (p.action, p.resource) in (('read', 'assets'), ('read', 'certificates'), ('update', 'assets'), ('delete', 'assets'))
on conflict do nothing;
insert into public.rbac_assignments (company_id, user_id, role_id) values
  ('e2000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'e7000000-0000-0000-0000-000000000001')
on conflict do nothing;
insert into public.rbac_company_modules (company_id, module_key, enabled) values
  ('e2000000-0000-0000-0000-000000000001', 'operations', true),
  ('e2000000-0000-0000-0000-000000000002', 'operations', true)
on conflict (company_id, module_key) do update set enabled = excluded.enabled;

select ok((select count(*) from pg_constraint where conname in ('assets_company_id_fkey', 'assets_location_same_company_fkey', 'assets_function_principle_same_company_fkey')) = 3, 'canonical ownership constraints exist');
select ok((select count(*) from public.assets where company_id is null) = 0, 'production assets have no legacy fixture rows');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'e1000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"e2000000-0000-0000-0000-000000000001"}', true);
select is((select count(*) from public.assets), 1::bigint, 'Company A reads only its asset');
select is((select count(*) from public.assets_certificates ac join public.certificates c on c.id = ac.certificate_id and c.company_id = ac.company_id), 1::bigint, 'Company A owns only its certificate link');
select is((select count(*) from public.assets where company_id is null), 0::bigint, 'legacy assets are invisible');
select throws_ok($$insert into public.assets (id, company_id, current_location_id, function_principle_id) values ('e5000000-0000-0000-0000-000000000003', 'e2000000-0000-0000-0000-000000000002', 'e3000000-0000-0000-0000-000000000002', 'e4000000-0000-0000-0000-000000000002')$$, '42501', null, 'Company A cannot insert Company B asset');
select is((select count(*) from public.assets where id='e5000000-0000-0000-0000-000000000002'), 0::bigint, 'direct ID tampering does not reveal Company B');
select results_eq($$update public.assets set is_active=false where id='e5000000-0000-0000-0000-000000000002' returning id$$, $$select null::uuid where false$$, 'Company A cannot update Company B asset');
select results_eq($$delete from public.assets where id='e5000000-0000-0000-0000-000000000002' returning id$$, $$select null::uuid where false$$, 'Company A cannot delete Company B asset');
select ok((select pg_get_constraintdef(oid) like '%locations(company_id, id)%' from pg_constraint where conname='assets_location_same_company_fkey'), 'location company mismatch is constrained');
select ok((select pg_get_constraintdef(oid) like '%functional_principles(company_id, id)%' from pg_constraint where conname='assets_function_principle_same_company_fkey'), 'principle company mismatch is constrained');
select ok((select count(*) from pg_policies where schemaname='storage' and tablename='objects' and policyname like 'certificates_%') >= 4, 'certificate storage policies remain tenant scoped');
select ok(not has_function_privilege('authenticated', 'public.get_asset_stats_by_functional_principle(uuid)', 'execute'), 'asset statistics remains revoked');
select set_config('request.jwt.claim.sub', 'e1000000-0000-0000-0000-000000000002', true);
select set_config('request.headers', '{"x-company-id":"e2000000-0000-0000-0000-000000000002"}', true);
select is((select count(*) from public.assets), 0::bigint, 'User B without capability cannot read Company B');
select set_config('request.jwt.claim.sub', 'e1000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"e2000000-0000-0000-0000-000000000003"}', true);
select is((select count(*) from public.assets), 0::bigint, 'inactive company request is denied');
select set_config('request.headers', '{"x-company-id":"e2000000-0000-0000-0000-000000000001"}', true);
select results_eq($$update public.certificates set storage_path='tampered.pdf' where id='e6000000-0000-0000-0000-000000000002' returning id$$, $$select null::uuid where false$$, 'Company A cannot update Company B certificate');
select results_eq($$delete from public.certificates where id='e6000000-0000-0000-0000-000000000002' returning id$$, $$select null::uuid where false$$, 'Company A cannot delete Company B certificate');
select throws_ok($$insert into public.certificates (id, company_id, storage_path, uploaded_by) values ('e6000000-0000-0000-0000-000000000003', 'e2000000-0000-0000-0000-000000000002', 'tampered.pdf', auth.uid())$$, '42501', null, 'Company A cannot insert certificate for Company B');

select * from finish();
rollback;
