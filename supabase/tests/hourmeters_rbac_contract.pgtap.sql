begin;
create extension if not exists pgtap with schema extensions;
select plan(13);

insert into auth.users (id, email) values
  ('e1000000-0000-0000-0000-000000000001', 'hourmeters-reader@example.test');
insert into public.rbac_principals (user_id, is_active) values
  ('e1000000-0000-0000-0000-000000000001', true);
insert into public.rbac_companies (id, name, is_active) values
  ('e2000000-0000-0000-0000-000000000001', 'Hourmeters Company', true);
insert into public.rbac_memberships (company_id, user_id, is_active) values
  ('e2000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', true);
insert into public.rbac_roles (id, company_id, name) values
  ('e3000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001', 'hourmeters-reader');
insert into public.rbac_permissions (id, action, resource) values
  ('e4000000-0000-0000-0000-000000000001', 'read', 'hour-meters')
on conflict (action, resource) do nothing;
insert into public.rbac_role_permissions (role_id, permission_id)
select 'e3000000-0000-0000-0000-000000000001', id
from public.rbac_permissions where action = 'read' and resource = 'hour-meters';
insert into public.rbac_assignments (company_id, user_id, role_id) values
  ('e2000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'e3000000-0000-0000-0000-000000000001');
insert into public.rbac_company_modules (company_id, module_key, enabled) values
  ('e2000000-0000-0000-0000-000000000001', 'hour-meters', true);

insert into public.locations (id, name, type, company_id) values
  ('e5000000-0000-0000-0000-000000000001', 'Rig A', 'rig', 'e2000000-0000-0000-0000-000000000001'),
  ('e5000000-0000-0000-0000-000000000002', 'Rig B', 'rig', 'e2000000-0000-0000-0000-000000000001');
insert into public.rigs (id) values
  ('e5000000-0000-0000-0000-000000000001'),
  ('e5000000-0000-0000-0000-000000000002');
insert into public.rbac_operational_scopes (company_id, user_id) values
  ('e2000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001');
insert into public.rbac_operational_scope_rigs (company_id, user_id, rig_id) values
  ('e2000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'e5000000-0000-0000-0000-000000000001');
insert into public.functional_principles (id, name, company_id) values
  ('e6000000-0000-0000-0000-000000000001', 'Motor de Combustión Interna', 'e2000000-0000-0000-0000-000000000001'),
  ('e6000000-0000-0000-0000-000000000002', 'Non Hourmeter Asset', 'e2000000-0000-0000-0000-000000000001');
insert into public.assets (id, company_id, current_location_id, function_principle_id) values
  ('e7000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001', 'e5000000-0000-0000-0000-000000000001', 'e6000000-0000-0000-0000-000000000001'),
  ('e7000000-0000-0000-0000-000000000002', 'e2000000-0000-0000-0000-000000000001', 'e5000000-0000-0000-0000-000000000002', 'e6000000-0000-0000-0000-000000000002');
insert into public.hourmeters_settings (company_id) values
  ('e2000000-0000-0000-0000-000000000001');
insert into public.asset_operational_parameters_history (id, company_id, asset_id, hours, created_by) values
  ('e8000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001', 'e7000000-0000-0000-0000-000000000001', 100, 'e1000000-0000-0000-0000-000000000001');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'e1000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"e2000000-0000-0000-0000-000000000001"}', true);

select ok(public.rbac_renew_authorization('e2000000-0000-0000-0000-000000000001'), 'reader renews the validated company context');
select ok(public.rbac_has_capability('e2000000-0000-0000-0000-000000000001', 'read', 'hour-meters', 'hour-meters'), 'canonical Hourmeters capability is effective');
select is((select count(*) from public.hourmeters_settings), 1::bigint, 'reader sees tenant Hourmeters settings');
select results_eq($$select id from public.assets order by id$$, $$values ('e7000000-0000-0000-0000-000000000001'::uuid)$$, 'reader sees only eligible tenant assets without read/assets');
select results_eq($$select asset_id from public.asset_operational_parameters_history$$, $$values ('e7000000-0000-0000-0000-000000000001'::uuid)$$, 'reader sees tenant Hourmeters history');
select results_eq($$select name from public.functional_principles order by name$$, $$values ('Motor de Combustión Interna'::text)$$, 'reader sees only eligible Hourmeters principles');
select results_eq($$select name from public.locations order by name$$, $$values ('Rig A'::text)$$, 'reader sees locations used by eligible Hourmeters assets');
select is(jsonb_array_length(public.rbac_user_rig_scope()->'rigs'), 1, 'user scope exposes only assigned active Rigs');
select ok(not public.rbac_operational_rig_allowed('e2000000-0000-0000-0000-000000000001', 'e5000000-0000-0000-0000-000000000002'), 'cross-Rig access is denied');
select ok((select with_check::text from pg_policies where schemaname = 'public' and tablename = 'asset_operational_parameters_history' and policyname = 'hourmeters_history_insert') like '%a.company_id = asset_operational_parameters_history.company_id%', 'hourmeter history insert policy qualifies asset tenant ownership');
set local role postgres;
delete from public.rbac_operational_scopes where company_id = 'e2000000-0000-0000-0000-000000000001' and user_id = 'e1000000-0000-0000-0000-000000000001';
set local role authenticated;
select ok(not public.rbac_operational_rig_allowed('e2000000-0000-0000-0000-000000000001', 'e5000000-0000-0000-0000-000000000001'), 'missing scope denies access');
set local role postgres;
insert into public.rbac_operational_scopes (company_id, user_id, all_rigs) values
  ('e2000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', true);
insert into public.locations (id, name, type, company_id) values
  ('e5000000-0000-0000-0000-000000000003', 'Future Rig', 'rig', 'e2000000-0000-0000-0000-000000000001');
insert into public.rigs (id) values ('e5000000-0000-0000-0000-000000000003');
set local role authenticated;
select is(jsonb_array_length(public.rbac_user_rig_scope()->'rigs'), 3, 'all_rigs includes future active Rigs');

select set_config('request.headers', '{}', true);
select is((select count(*) from public.assets), 0::bigint, 'missing company context fails closed');

select * from finish();
rollback;
