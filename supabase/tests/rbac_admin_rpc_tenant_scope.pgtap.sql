begin;
create extension if not exists pgtap with schema extensions;
select plan(33);

insert into auth.users (id, email) values
  ('12000000-0000-0000-0000-000000000001', 'rpc-admin@example.test'),
  ('12000000-0000-0000-0000-000000000002', 'rpc-member-a@example.test'),
  ('12000000-0000-0000-0000-000000000003', 'rpc-member-b@example.test');
insert into public.rbac_principals (user_id, is_active) values
  ('12000000-0000-0000-0000-000000000001', true),
  ('12000000-0000-0000-0000-000000000002', true),
  ('12000000-0000-0000-0000-000000000003', true);
insert into public.rbac_companies (id, name) values
  ('22000000-0000-0000-0000-000000000001', 'RPC Company A'),
  ('22000000-0000-0000-0000-000000000002', 'RPC Company B');
insert into public.rbac_roles (id, name, company_id) values
  ('32000000-0000-0000-0000-000000000001', 'rpc-admin', '22000000-0000-0000-0000-000000000001'),
  ('32000000-0000-0000-0000-000000000002', 'rpc-reader', '22000000-0000-0000-0000-000000000002');
insert into public.rbac_role_permissions (role_id, permission_id) values
  ('32000000-0000-0000-0000-000000000001', (select id from public.rbac_permissions where action = 'manage' and resource = 'access-control'));
insert into public.rbac_memberships (company_id, user_id, is_active) values
  ('22000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000001', true),
  ('22000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000002', true),
  ('22000000-0000-0000-0000-000000000002', '12000000-0000-0000-0000-000000000003', true);
insert into public.rbac_assignments (company_id, user_id, role_id) values
  ('22000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000001', '32000000-0000-0000-0000-000000000001'),
  ('22000000-0000-0000-0000-000000000002', '12000000-0000-0000-0000-000000000003', '32000000-0000-0000-0000-000000000002');
insert into public.rbac_company_modules (company_id, module_key, enabled) values
  ('22000000-0000-0000-0000-000000000001', 'access-control', true),
  ('22000000-0000-0000-0000-000000000002', 'access-control', true);
select set_config('test.access_control_permission_id', (select id::text from public.rbac_permissions where action = 'manage' and resource = 'access-control'), true);

set local role authenticated;
select set_config('request.jwt.claim.sub', '12000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{}', true);
select throws_ok(
  $$select public.rbac_admin_snapshot()$$,
  '42501',
  'a valid active company context is required',
  'snapshot rejects missing tenant context'
);

select set_config('request.headers', '{"x-company-id":"22000000-0000-0000-0000-000000000001"}', true);
select ok(public.rbac_renew_authorization('22000000-0000-0000-0000-000000000001'), 'admin authorization renews');
select is((public.rbac_admin_snapshot()->'companies'->0->>'id'), '22000000-0000-0000-0000-000000000001', 'snapshot exposes only the active company');
select is(jsonb_array_length(public.rbac_admin_snapshot()->'companies'), 1, 'snapshot omits other companies');
select is(jsonb_array_length(public.rbac_admin_snapshot()->'roles'), 1, 'snapshot tenant-scopes roles');
select is(jsonb_array_length(public.rbac_admin_snapshot()->'users'), 2, 'snapshot tenant-scopes users through memberships');
select is(jsonb_array_length(public.rbac_admin_snapshot()->'memberships'), 2, 'snapshot tenant-scopes memberships');
select is(jsonb_array_length(public.rbac_admin_snapshot()->'assignments'), 1, 'snapshot tenant-scopes assignments');

select throws_ok(
  $$select public.rbac_admin_command('{"type":"create-role","companyId":"22000000-0000-0000-0000-000000000002","role":{"name":"cross-tenant"}}')$$,
  '42501',
  'command company does not match the active tenant',
  'command rejects a cross-tenant payload'
);
select throws_ok(
  $$select public.rbac_admin_command('{"type":"set-membership","companyId":"22000000-0000-0000-0000-000000000001","membership":{"companyId":"22000000-0000-0000-0000-000000000002","userId":"12000000-0000-0000-0000-000000000003","isActive":true}}')$$,
  '42501',
  'command company does not match the active tenant',
  'command rejects conflicting company fields'
);
select lives_ok(
  $$select public.rbac_admin_command('{"type":"create-role","companyId":"22000000-0000-0000-0000-000000000001","role":{"name":"rpc-created"}}')$$,
  'tenant role creation works'
);
select is((select count(*) from public.rbac_roles where company_id = '22000000-0000-0000-0000-000000000001' and name = 'rpc-created'), 1::bigint, 'tenant role is created');
select lives_ok(
  $$select public.rbac_admin_command(jsonb_build_object('type', 'update-role', 'companyId', '22000000-0000-0000-0000-000000000001', 'roleId', (select id from public.rbac_roles where name = 'rpc-created'), 'role', jsonb_build_object('name', 'rpc-updated')))$$,
  'tenant role update works'
);
select is((select count(*) from public.rbac_roles where company_id = '22000000-0000-0000-0000-000000000001' and name = 'rpc-updated'), 1::bigint, 'tenant role is updated');
select lives_ok(
  $$select public.rbac_admin_command(jsonb_build_object('type', 'set-permission', 'companyId', '22000000-0000-0000-0000-000000000001', 'roleId', (select id from public.rbac_roles where name = 'rpc-updated'), 'permissionId', current_setting('test.access_control_permission_id'), 'enabled', true))$$,
  'tenant role permission update works'
);
select is((select count(*) from public.rbac_role_permissions rp join public.rbac_roles r on r.id = rp.role_id where r.name = 'rpc-updated'), 1::bigint, 'tenant role permission is assigned');
select lives_ok(
  $$select public.rbac_admin_command('{"type":"set-membership","membership":{"companyId":"22000000-0000-0000-0000-000000000001","userId":"12000000-0000-0000-0000-000000000002","isActive":false}}')$$,
  'tenant membership update works'
);
select is((select is_active from public.rbac_memberships where company_id = '22000000-0000-0000-0000-000000000001' and user_id = '12000000-0000-0000-0000-000000000002'), false, 'tenant membership is updated');
select lives_ok(
  $$select public.rbac_admin_command(jsonb_build_object('type', 'set-assignment', 'assignment', jsonb_build_object('companyId', '22000000-0000-0000-0000-000000000001', 'userId', '12000000-0000-0000-0000-000000000002', 'roleId', (select id from public.rbac_roles where name = 'rpc-updated'))))$$,
  'tenant assignment creation works'
);
select is((select count(*) from public.rbac_assignments a join public.rbac_roles r on r.id = a.role_id where a.user_id = '12000000-0000-0000-0000-000000000002' and r.name = 'rpc-updated'), 1::bigint, 'tenant assignment is created');
select lives_ok(
  $$select public.rbac_admin_command(jsonb_build_object('type', 'remove-assignment', 'assignment', jsonb_build_object('companyId', '22000000-0000-0000-0000-000000000001', 'userId', '12000000-0000-0000-0000-000000000002', 'roleId', (select id from public.rbac_roles where name = 'rpc-updated'))))$$,
  'tenant assignment removal works'
);
select is((select count(*) from public.rbac_assignments a join public.rbac_roles r on r.id = a.role_id where a.user_id = '12000000-0000-0000-0000-000000000002' and r.name = 'rpc-updated'), 0::bigint, 'tenant assignment is removed');
select lives_ok(
  $$select public.rbac_admin_command('{"type":"remove-membership","membership":{"companyId":"22000000-0000-0000-0000-000000000001","userId":"12000000-0000-0000-0000-000000000002"}}')$$,
  'tenant membership removal works'
);
select is((select count(*) from public.rbac_memberships where company_id = '22000000-0000-0000-0000-000000000001' and user_id = '12000000-0000-0000-0000-000000000002'), 0::bigint, 'tenant membership is removed');
select lives_ok(
  $$select public.rbac_admin_command(jsonb_build_object('type', 'delete-role', 'companyId', '22000000-0000-0000-0000-000000000001', 'roleId', (select id from public.rbac_roles where name = 'rpc-updated')))$$,
  'tenant role deletion works'
);
select is((select count(*) from public.rbac_roles where company_id = '22000000-0000-0000-0000-000000000001' and name = 'rpc-updated'), 0::bigint, 'tenant role is deleted');
select throws_ok(
  $$select public.rbac_admin_command('{"type":"set-user","userId":"12000000-0000-0000-0000-000000000002","isActive":false}')$$,
  '0A000',
  'unsupported tenant administration command: set-user',
  'global user status operation fails clearly'
);
select throws_ok(
  $$select public.rbac_admin_command('{"type":"create-company","company":{"name":"Global Company"}}')$$,
  '0A000',
  'unsupported tenant administration command: create-company',
  'global company creation fails clearly'
);
select ok(not has_function_privilege('anon', 'public.rbac_admin_snapshot()', 'execute'), 'anon cannot execute the snapshot RPC');
select ok(not has_function_privilege('public', 'public.rbac_admin_snapshot()', 'execute'), 'PUBLIC cannot execute the snapshot RPC');
select ok(not has_function_privilege('anon', 'public.rbac_admin_command(jsonb)', 'execute'), 'anon cannot execute the command RPC');
select ok(has_function_privilege('authenticated', 'public.rbac_admin_snapshot()', 'execute'), 'authenticated can execute the snapshot RPC');
select ok(has_function_privilege('authenticated', 'public.rbac_admin_command(jsonb)', 'execute'), 'authenticated can execute the command RPC');

select * from finish();
rollback;
