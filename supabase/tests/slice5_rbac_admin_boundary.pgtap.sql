begin;
create extension if not exists pgtap with schema extensions;
select plan(24);

delete from public.rbac_role_permissions;
delete from public.rbac_assignments;
delete from public.rbac_memberships;
delete from public.rbac_company_modules;
delete from public.rbac_audit_events;
delete from public.assets_certificates;
delete from public.certificates;
delete from public.assets;
delete from public.rbac_roles;
delete from public.rbac_permissions;
delete from public.rbac_companies;
delete from public.rbac_principals;

insert into auth.users (id, email) values
  ('11000000-0000-0000-0000-000000000001', 'slice5-a@example.test'),
  ('11000000-0000-0000-0000-000000000002', 'slice5-b@example.test');
insert into public.rbac_principals (user_id, is_active) values
  ('11000000-0000-0000-0000-000000000001', true),
  ('11000000-0000-0000-0000-000000000002', true);
insert into public.rbac_companies (id, name) values
  ('21000000-0000-0000-0000-000000000001', 'Slice 5 Company A'),
  ('21000000-0000-0000-0000-000000000002', 'Slice 5 Company B');
insert into public.rbac_roles (id, name, company_id) values
  ('31000000-0000-0000-0000-000000000001', 'slice5-admin', '21000000-0000-0000-0000-000000000001'),
  ('31000000-0000-0000-0000-000000000002', 'slice5-reader', '21000000-0000-0000-0000-000000000002');
insert into public.rbac_permissions (id, action, resource) values
  ('41000000-0000-0000-0000-000000000001', 'manage', 'access-control'),
  ('41000000-0000-0000-0000-000000000002', 'read', 'authorization-audit');
insert into public.rbac_role_permissions (role_id, permission_id) values
  ('31000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000001'),
  ('31000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000002');
insert into public.rbac_memberships (company_id, user_id, is_active) values
  ('21000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', true),
  ('21000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', false),
  ('21000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000002', true);
insert into public.rbac_assignments (company_id, user_id, role_id) values
  ('21000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001');
insert into public.rbac_company_modules (company_id, module_key, enabled) values
  ('21000000-0000-0000-0000-000000000001', 'operations', true),
  ('21000000-0000-0000-0000-000000000002', 'operations', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"21000000-0000-0000-0000-000000000001"}', true);
select ok(public.rbac_renew_authorization('21000000-0000-0000-0000-000000000001'), 'User A active membership renews');
select ok(public.rbac_has_capability('21000000-0000-0000-0000-000000000001', 'manage', 'access-control'), 'User A admin capability is effective');
select lives_ok($$insert into public.rbac_roles(name, company_id) values ('created-by-a', '21000000-0000-0000-0000-000000000001')$$, 'same-company role creation is allowed');
select lives_ok($$update public.rbac_roles set name = 'updated-by-a' where name = 'created-by-a'$$, 'same-company role update is allowed');
select lives_ok($$delete from public.rbac_roles where name = 'updated-by-a'$$, 'same-company role delete is allowed');
select lives_ok($$update public.rbac_memberships set is_active = false where company_id = '21000000-0000-0000-0000-000000000001' and user_id = '11000000-0000-0000-0000-000000000002'$$, 'same-company membership write is allowed');
select results_eq($$select company_id::text from public.rbac_roles where company_id = '21000000-0000-0000-0000-000000000002'$$, array[]::text[], 'cross-company role read is denied');
select throws_ok($$insert into public.rbac_roles(name, company_id) values ('cross-write', '21000000-0000-0000-0000-000000000002')$$, '42501', 'new row violates row-level security policy for table "rbac_roles"', 'cross-company role write is denied');
select results_eq($$delete from public.rbac_memberships where company_id = '21000000-0000-0000-0000-000000000002' returning user_id$$, $$select null::uuid where false$$, 'cross-company membership delete is denied');
select throws_ok($$insert into public.rbac_companies(name) values ('global-create-denied')$$, '42501', 'permission denied for table rbac_companies', 'global company creation is denied');
select throws_ok($$insert into public.rbac_permissions(action, resource) values ('delete', 'global')$$, '42501', 'permission denied for table rbac_permissions', 'global permission creation is denied');
select throws_ok($$insert into public.rbac_role_permissions(role_id, permission_id) values ('31000000-0000-0000-0000-000000000002', '41000000-0000-0000-0000-000000000001')$$, '42501', 'new row violates row-level security policy for table "rbac_role_permissions"', 'cross-company role-permission write is denied');
select lives_ok($$select public.rbac_record_audit('21000000-0000-0000-0000-000000000001', 'slice5.test', 'allowed', '{"source":"pgtap"}')$$, 'same-company audit append is allowed through RPC');
select throws_ok($$select public.rbac_record_audit('21000000-0000-0000-0000-000000000002', 'slice5.spoof', 'allowed')$$, '42501', 'audit company must match an active request company', 'cross-company audit spoof is denied');
select set_config('request.headers', '{}', true);
select throws_ok($$select public.rbac_record_audit('21000000-0000-0000-0000-000000000001', 'slice5.no-header', 'allowed')$$, '42501', 'audit company must match an active request company', 'missing company header denies audit');
select set_config('request.headers', '{"x-company-id":"21000000-0000-0000-0000-000000000001"}', true);
select results_eq($$select company_id::text from public.rbac_audit_events where event_type = 'slice5.test'$$, array['21000000-0000-0000-0000-000000000001'], 'audit event is tenant scoped');
select throws_ok($$update public.rbac_audit_events set target = '{}' where event_type = 'slice5.test'$$, '42501', 'permission denied for table rbac_audit_events', 'audit update is immutable');
select throws_ok($$delete from public.rbac_audit_events where event_type = 'slice5.test'$$, '42501', 'permission denied for table rbac_audit_events', 'audit delete is immutable');

select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000002', true);
select ok(not public.rbac_has_capability('21000000-0000-0000-0000-000000000001', 'manage', 'access-control'), 'User B reader lacks admin capability');
select throws_ok($$insert into public.rbac_memberships(company_id, user_id) values ('21000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000002')$$, '42501', 'new row violates row-level security policy for table "rbac_memberships"', 'reader cannot mutate administration');
select set_config('request.jwt.claim.sub', '11000000-0000-0000-0000-000000000001', true);
select ok(not public.rbac_renew_authorization('21000000-0000-0000-0000-000000000002'), 'inactive membership denies Company B');
select throws_ok($$select public.rbac_record_audit('21000000-0000-0000-0000-000000000002', 'slice5.inactive', 'allowed')$$, '42501', 'audit company must match an active request company', 'inactive membership denies audit');
select set_config('request.headers', '{"x-company-id":"21000000-0000-0000-0000-000000000099"}', true);
select ok(not public.rbac_renew_authorization('21000000-0000-0000-0000-000000000099'), 'missing company denies authorization');
select is((select count(*) from public.rbac_companies where name = 'global-create-denied'), 0::bigint, 'global fixture was not created');
select * from finish();
rollback;
