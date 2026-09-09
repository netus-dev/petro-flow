begin;
create extension if not exists pgtap with schema extensions;
select plan(15);

insert into auth.users (id, email) values
  ('61000000-0000-0000-0000-000000000001', 'provision-admin@example.test'),
  ('61000000-0000-0000-0000-000000000002', 'provision-target@example.test'),
  ('61000000-0000-0000-0000-000000000003', 'provision-reader@example.test');
insert into public.rbac_principals (user_id, is_active) values
  ('61000000-0000-0000-0000-000000000001', true),
  ('61000000-0000-0000-0000-000000000003', true);
insert into public.rbac_companies (id, name) values
  ('62000000-0000-0000-0000-000000000001', 'Provision Company A'),
  ('62000000-0000-0000-0000-000000000002', 'Provision Company B');
insert into public.rbac_roles (id, name, company_id) values
  ('63000000-0000-0000-0000-000000000001', 'provision-admin', '62000000-0000-0000-0000-000000000001'),
  ('63000000-0000-0000-0000-000000000002', 'provision-reader', '62000000-0000-0000-0000-000000000002');
insert into public.rbac_permissions (id, action, resource)
values ('64000000-0000-0000-0000-000000000001', 'manage', 'access-control')
on conflict (action, resource) do nothing;
insert into public.rbac_role_permissions (role_id, permission_id)
select '63000000-0000-0000-0000-000000000001', id
from public.rbac_permissions
where action = 'manage' and resource = 'access-control';
insert into public.rbac_memberships (company_id, user_id, is_active) values
  ('62000000-0000-0000-0000-000000000001', '61000000-0000-0000-0000-000000000001', true),
  ('62000000-0000-0000-0000-000000000001', '61000000-0000-0000-0000-000000000003', true);
insert into public.rbac_assignments (company_id, user_id, role_id) values
  ('62000000-0000-0000-0000-000000000001', '61000000-0000-0000-0000-000000000001', '63000000-0000-0000-0000-000000000001');
insert into public.rbac_company_modules (company_id, module_key, enabled) values
  ('62000000-0000-0000-0000-000000000001', 'access-control', true),
  ('62000000-0000-0000-0000-000000000002', 'access-control', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', '61000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"62000000-0000-0000-0000-000000000001"}', true);
select ok(public.rbac_renew_authorization('62000000-0000-0000-0000-000000000001'), 'admin authorization renews');
select lives_ok($$select public.rbac_provision_user_access('61000000-0000-0000-0000-000000000002', '63000000-0000-0000-0000-000000000001')$$, 'provisioning succeeds');
set local role postgres;
select is((select count(*) from public.rbac_principals where user_id = '61000000-0000-0000-0000-000000000002' and is_active), 1::bigint, 'principal is provisioned');
select is((select count(*) from public.rbac_memberships where company_id = '62000000-0000-0000-0000-000000000001' and user_id = '61000000-0000-0000-0000-000000000002' and is_active), 1::bigint, 'membership is provisioned');
select is((select count(*) from public.rbac_assignments where company_id = '62000000-0000-0000-0000-000000000001' and user_id = '61000000-0000-0000-0000-000000000002' and role_id = '63000000-0000-0000-0000-000000000001'), 1::bigint, 'role assignment is provisioned');
select is((select count(*) from public.rbac_audit_events where event_type = 'access_control.user_provisioned' and company_id = '62000000-0000-0000-0000-000000000001'), 1::bigint, 'provisioning is audited');
set local role authenticated;
select lives_ok($$select public.rbac_provision_user_access('61000000-0000-0000-0000-000000000002', '63000000-0000-0000-0000-000000000001')$$, 'repeated provisioning succeeds');
set local role postgres;
select is((select count(*) from public.rbac_principals where user_id = '61000000-0000-0000-0000-000000000002'), 1::bigint, 'repeated provisioning does not duplicate principal');
select is((select count(*) from public.rbac_memberships where company_id = '62000000-0000-0000-0000-000000000001' and user_id = '61000000-0000-0000-0000-000000000002'), 1::bigint, 'repeated provisioning does not duplicate membership');
select is((select count(*) from public.rbac_assignments where company_id = '62000000-0000-0000-0000-000000000001' and user_id = '61000000-0000-0000-0000-000000000002'), 1::bigint, 'repeated provisioning does not duplicate assignment');
set local role authenticated;
select throws_ok($$select public.rbac_provision_user_access('61000000-0000-0000-0000-000000000002', '63000000-0000-0000-0000-000000000002')$$, '22023', 'provisioning role does not belong to the active tenant', 'cross-tenant role is rejected');
select throws_ok($$select public.rbac_provision_user_access('61000000-0000-0000-0000-000000000002', '63000000-0000-0000-0000-000000000001', '62000000-0000-0000-0000-000000000002')$$, '42501', 'provisioning company does not match the active tenant', 'tenant mismatch is rejected');
select set_config('request.jwt.claim.sub', '61000000-0000-0000-0000-000000000003', true);
select throws_ok($$select public.rbac_provision_user_access('61000000-0000-0000-0000-000000000002', '63000000-0000-0000-0000-000000000001')$$, '42501', 'access-control administration is forbidden', 'missing manage access-control is rejected');
select ok(not has_function_privilege('anon', 'public.rbac_provision_user_access(uuid,uuid,uuid)', 'execute'), 'anon cannot execute provisioning');
select ok(has_function_privilege('authenticated', 'public.rbac_provision_user_access(uuid,uuid,uuid)', 'execute'), 'authenticated can execute provisioning');

select * from finish();
rollback;
