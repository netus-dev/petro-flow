-- Historical pre-retirement migration assertions.
-- Run only through rbac_legacy_backfill_projection_checkpoint.sql, which owns
-- the transaction and supplies the legacy contracts temporarily.
select plan(15);

delete from public.rbac_role_permissions;
delete from public.rbac_assignments;
delete from public.rbac_memberships;
delete from public.rbac_company_modules;
delete from public.rbac_documents;
delete from public.rbac_roles;
delete from public.rbac_permissions;
delete from public.rbac_companies;
delete from public.rbac_principals;

insert into auth.users (id, email) values
  ('11000000-0000-0000-0000-000000000001', 'backfill-a@example.test'),
  ('11000000-0000-0000-0000-000000000002', 'backfill-b@example.test');
insert into public.companies (id, name, is_active) values
  ('21000000-0000-0000-0000-000000000001', 'Company A', true),
  ('21000000-0000-0000-0000-000000000002', 'Company B', true);
insert into public.users (id, name, is_active, company_id) values
  ('11000000-0000-0000-0000-000000000001', 'User A', true, '21000000-0000-0000-0000-000000000001'),
  ('11000000-0000-0000-0000-000000000002', 'Inactive User', false, '21000000-0000-0000-0000-000000000001')
on conflict (id) do update set name = excluded.name, is_active = excluded.is_active, company_id = excluded.company_id;
insert into auth.users (id, email) values
  ('11000000-0000-0000-0000-000000000003', 'backfill-c@example.test');
insert into public.users (id, name, is_active, company_id) values
  ('11000000-0000-0000-0000-000000000003', 'User C', true, '21000000-0000-0000-0000-000000000001')
on conflict (id) do update set name = excluded.name, is_active = excluded.is_active, company_id = excluded.company_id;
insert into public.roles (id, name, company_id) values
  ('31000000-0000-0000-0000-000000000001', 'operator', '21000000-0000-0000-0000-000000000001'),
  ('31000000-0000-0000-0000-000000000002', 'viewer', '21000000-0000-0000-0000-000000000002');
insert into public.roles (id, name, company_id) values
  ('31000000-0000-0000-0000-000000000003', 'auditor', '21000000-0000-0000-0000-000000000001');
insert into public.permissions (id, name, company_id) values
  ('41000000-0000-0000-0000-000000000001', 'read.documents', '21000000-0000-0000-0000-000000000001'),
  ('41000000-0000-0000-0000-000000000002', 'read.documents', '21000000-0000-0000-0000-000000000002')
on conflict (name) do nothing;
insert into public.role_permissions (role_id, permission_id)
select '31000000-0000-0000-0000-000000000001', id from public.permissions where name = 'read.documents' limit 1;
insert into public.permissions (id, name, company_id) values
  ('41000000-0000-0000-0000-000000000003', 'manage.documents', '21000000-0000-0000-0000-000000000001');
insert into public.role_permissions (role_id, permission_id)
select '31000000-0000-0000-0000-000000000003', id from public.permissions where name = 'manage.documents';
insert into public.user_roles (user_id, role_id) values
  ('11000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001'),
  ('11000000-0000-0000-0000-000000000002', '31000000-0000-0000-0000-000000000002');
insert into public.user_roles (user_id, role_id) values
  ('11000000-0000-0000-0000-000000000003', '31000000-0000-0000-0000-000000000003');

select public.rbac_rehearse_legacy_consolidation();
select is((select count(*) from public.rbac_memberships where user_id = '11000000-0000-0000-0000-000000000001'), 1::bigint, 'valid default company creates membership');
insert into public.rbac_memberships values ('21000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', true);
select is((select count(*) from public.rbac_memberships where user_id = '11000000-0000-0000-0000-000000000001' and is_active), 2::bigint, 'one user can belong to companies A and B');
select is((select count(*) from public.rbac_assignments where user_id = '11000000-0000-0000-0000-000000000001'), 1::bigint, 'assignment remains company-scoped');
select is((select count(*) from public.rbac_assignments where user_id = '11000000-0000-0000-0000-000000000003' and company_id = '21000000-0000-0000-0000-000000000001'), 1::bigint, 'different user receives an independent company assignment');
select is((select count(*) from public.rbac_roles where company_id = '21000000-0000-0000-0000-000000000001'), 2::bigint, 'roles retain company scope');
select is((select count(*) from public.rbac_permissions), 2::bigint, 'valid permissions are reused by capability');
select ok(not public.rbac_has_capability('21000000-0000-0000-0000-000000000002', 'read', 'documents', null), 'membership without role denies capability');
select is((select count(*) from public.rbac_permissions where action = 'read' and resource = 'documents'), 1::bigint, 'global capability is reused across companies');
select public.rbac_rehearse_legacy_consolidation();
select is((select count(*) from public.rbac_memberships), 4::bigint, 'rerun does not duplicate memberships');
select is((select count(*) from public.rbac_assignments), 2::bigint, 'rerun does not duplicate assignments');
update public.rbac_memberships set is_active = false where user_id = '11000000-0000-0000-0000-000000000001' and company_id = '21000000-0000-0000-0000-000000000001';
select ok(not public.rbac_has_capability('21000000-0000-0000-0000-000000000001', 'read', 'documents', null), 'inactive membership denies access');
select ok(not public.rbac_has_capability('21000000-0000-0000-0000-000000000001', 'read', 'documents', null), 'inactive lifecycle remains denied');
select ok(to_regclass('public.rbac_compat_reconciliation') is null, 'persistent reconciliation surface is absent');
select ok(not exists (select 1 from public.rbac_assignments where user_id = '11000000-0000-0000-0000-000000000002'), 'role without same-company membership receives no assignment');
select ok(to_regclass('public.rbac_compat_exceptions') is null, 'unusable role assignment is not retained in schema');
select * from finish();
