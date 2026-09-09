begin;
create extension if not exists pgtap with schema extensions;
select plan(15);

insert into public.rbac_permissions (id, action, resource)
values ('a4000000-0000-0000-0000-000000000099', 'create', 'movements');
insert into public.rbac_role_permissions (role_id, permission_id)
values ('93000000-0000-0000-0000-000000000001', 'a4000000-0000-0000-0000-000000000099');
insert into public.ubications (id, name, company_id, is_active)
values
  ('b6000000-0000-0000-0000-000000000001', 'Seed Position A', '92000000-0000-0000-0000-000000000001', true),
  ('b6000000-0000-0000-0000-000000000003', 'Seed Position A2', '92000000-0000-0000-0000-000000000001', true),
  ('b6000000-0000-0000-0000-000000000002', 'Seed Position B', '92000000-0000-0000-0000-000000000002', true);
insert into public.locations (id, name, type, company_id)
values ('b7000000-0000-0000-0000-000000000002', 'Seed Yard B', 'operating_base', '92000000-0000-0000-0000-000000000002');
insert into public.functional_principles (id, name, company_id)
values ('b9000000-0000-0000-0000-000000000002', 'Seed Equipment B', '92000000-0000-0000-0000-000000000002');
insert into public.assets (id, company_id, current_location_id, current_ubication_id, function_principle_id, is_active)
values
  ('c8000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000001', '96000000-0000-0000-0000-000000000001', 'b6000000-0000-0000-0000-000000000001', '97000000-0000-0000-0000-000000000001', true),
  ('c8000000-0000-0000-0000-000000000003', '92000000-0000-0000-0000-000000000001', '96000000-0000-0000-0000-000000000001', 'b6000000-0000-0000-0000-000000000001', '97000000-0000-0000-0000-000000000001', true),
  ('c8000000-0000-0000-0000-000000000002', '92000000-0000-0000-0000-000000000002', 'b7000000-0000-0000-0000-000000000002', 'b6000000-0000-0000-0000-000000000002', 'b9000000-0000-0000-0000-000000000002', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', '91000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"92000000-0000-0000-0000-000000000001"}', true);
select ok(public.rbac_renew_authorization('92000000-0000-0000-0000-000000000001'), 'authorized fixture is active');
select lives_ok($$select public.register_bulk_movement('{"type":"transfer","origin_location_id":"96000000-0000-0000-0000-000000000001","destination_location_id":"96000000-0000-0000-0000-000000000001","destination_ubication_id":"b6000000-0000-0000-0000-000000000001","justification":"authorized","assets":[{"asset_id":"98000000-0000-0000-0000-000000000001"}]}'::jsonb)$$, 'authorized bulk movement succeeds');
set local role postgres;
select is((select current_ubication_id from public.assets where id = '98000000-0000-0000-0000-000000000001'), 'b6000000-0000-0000-0000-000000000001'::uuid, 'authorized bulk movement updates the asset');
set local role authenticated;
select lives_ok($$select public.register_replacement_movement('{"type":"replacement","location_id":"96000000-0000-0000-0000-000000000001","asset_a_id":"c8000000-0000-0000-0000-000000000001","asset_b_id":"c8000000-0000-0000-0000-000000000003","asset_b_destination_ubication_id":"b6000000-0000-0000-0000-000000000003","justification":"authorized replacement"}'::jsonb)$$, 'authorized replacement succeeds atomically');
set local role postgres;
select is((select current_ubication_id from public.assets where id = 'c8000000-0000-0000-0000-000000000001'), 'b6000000-0000-0000-0000-000000000001'::uuid, 'replacement moves asset A to asset B former position');
select is((select current_ubication_id from public.assets where id = 'c8000000-0000-0000-0000-000000000003'), 'b6000000-0000-0000-0000-000000000003'::uuid, 'replacement moves asset B to requested position');
set local role authenticated;
select throws_ok($$select public.register_bulk_movement('{}'::jsonb)$$, '22023', 'invalid movement payload', 'invalid bulk payload is rejected');
select throws_ok($$select public.register_replacement_movement('{"type":"replacement","location_id":"96000000-0000-0000-0000-000000000001","asset_a_id":"c8000000-0000-0000-0000-000000000001","asset_b_id":"c8000000-0000-0000-0000-000000000001","asset_b_destination_ubication_id":"b6000000-0000-0000-0000-000000000001","justification":"invalid"}'::jsonb)$$, '22023', 'replacement requires two distinct assets', 'replacement rejects duplicate assets before writing');
select is((select count(*) from public.transactions where justification in ('invalid', 'unauthorized')), 0::bigint, 'rejected calls leave no transactions');
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.headers', '{}', true);
set local role anon;
select throws_ok($$select public.register_bulk_movement('{}'::jsonb)$$, '42501', null, 'anonymous bulk execution is rejected');
select throws_ok($$select public.register_replacement_movement('{}'::jsonb)$$, '42501', null, 'anonymous replacement execution is rejected');
set local role authenticated;
select set_config('request.jwt.claim.sub', '91000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"92000000-0000-0000-0000-000000000001"}', true);
select throws_ok($$select public.register_bulk_movement('{"type":"transfer","origin_location_id":"96000000-0000-0000-0000-000000000001","destination_location_id":"96000000-0000-0000-0000-000000000001","destination_ubication_id":"b6000000-0000-0000-0000-000000000002","justification":"cross","assets":[{"asset_id":"b8000000-0000-0000-0000-000000000001"}]}'::jsonb)$$, '23514', 'movement location ownership validation failed', 'cross-tenant ubication is rejected');
select throws_ok($$select public.register_replacement_movement('{"type":"replacement","location_id":"96000000-0000-0000-0000-000000000001","asset_a_id":"b8000000-0000-0000-0000-000000000001","asset_b_id":"b8000000-0000-0000-0000-000000000002","asset_b_destination_ubication_id":"b6000000-0000-0000-0000-000000000001","justification":"cross"}'::jsonb)$$, '23514', 'replacement ownership validation failed', 'cross-tenant replacement asset is rejected');
select is((select count(*) from public.transaction_details where asset_id in ('b8000000-0000-0000-0000-000000000001', 'b8000000-0000-0000-0000-000000000002')), 0::bigint, 'rejected replacement leaves no orphan details');
set local role postgres;
select is((select current_ubication_id from public.assets where id = 'c8000000-0000-0000-0000-000000000001'), 'b6000000-0000-0000-0000-000000000001'::uuid, 'rejected replacement leaves assets unchanged');
select * from finish();
rollback;
