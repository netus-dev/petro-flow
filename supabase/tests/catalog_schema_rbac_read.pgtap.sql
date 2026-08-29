begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

select has_table('public', 'brands', 'brands table exists');
select has_table('public', 'models', 'models table exists');
select has_table('public', 'suppliers', 'suppliers table exists');
select has_table('public', 'wells', 'wells table exists');
select has_table('public', 'operating_bases', 'operating_bases table exists');
select has_table('public', 'rigs', 'rigs table exists');
select col_is_fk('public', 'models', 'brand_id', 'models brand relationship exists');
select col_is_fk('public', 'operating_bases', 'id', 'operating base location relationship exists');
select col_is_fk('public', 'rigs', 'current_well_id', 'rig current well relationship exists');
select has_function('public', 'rbac_can_read_catalog', array['uuid'], 'catalog read capability function exists');

insert into public.rbac_permissions (id, action, resource) values
  ('f4000000-0000-0000-0000-000000000001', 'read', 'catalogs');
insert into public.rbac_role_permissions (role_id, permission_id) values
  ('93000000-0000-0000-0000-000000000001', 'f4000000-0000-0000-0000-000000000001');
insert into public.brands (id, name, company_id) values
  ('95000000-0000-0000-0000-000000000001', 'A brand', '92000000-0000-0000-0000-000000000001'),
  ('95000000-0000-0000-0000-000000000002', 'B brand', '92000000-0000-0000-0000-000000000002');

set local role authenticated;
select set_config('request.jwt.claim.sub', '91000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"92000000-0000-0000-0000-000000000001"}', true);
select ok(public.rbac_can_read_catalog('92000000-0000-0000-0000-000000000001'), 'active company capability allows catalog reads');
select ok(not public.rbac_can_read_catalog('92000000-0000-0000-0000-000000000002'), 'cross-company read is denied');
select results_eq('select name from public.brands order by name', array['A brand'::text], 'RLS hides cross-company catalog rows');
select ok(not public.rbac_renew_authorization('92000000-0000-0000-0000-000000000002'), 'inactive or absent membership denies renewal');

select * from finish();
rollback;
