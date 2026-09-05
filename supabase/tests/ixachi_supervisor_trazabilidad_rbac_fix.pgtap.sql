begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

select is((select count(*)
  from public.rbac_role_permissions rp
  join public.rbac_roles r on r.id = rp.role_id
  where r.company_id = 'f1000000-0000-0000-0000-000000000001'
    and r.name in ('Supervisor Electrician', 'Supervisor Mechanic')
    and exists (select 1 from public.rbac_permissions p
      where p.id = rp.permission_id and p.action = 'read' and p.resource = 'trazabilidad')),
  0::bigint, 'Ixachi supervisors do not have traceability read');

select is((select count(*)
  from public.rbac_role_permissions rp
  join public.rbac_roles r on r.id = rp.role_id
  join public.rbac_permissions p on p.id = rp.permission_id
  where r.company_id = 'f1000000-0000-0000-0000-000000000001'
    and r.name in ('Supervisor Electrician', 'Supervisor Mechanic')
    and p.resource = 'hour-meters'
    and p.action in ('read', 'register', 'update')),
  6::bigint, 'Ixachi supervisors retain hour-meter permissions');

select is((select count(*)
  from public.rbac_role_permissions rp
  join public.rbac_roles r on r.id = rp.role_id
  join public.rbac_permissions p on p.id = rp.permission_id
  where r.company_id = 'f1000000-0000-0000-0000-000000000001'
    and r.name = 'Tool Pusher'
    and p.resource = 'trazabilidad' and p.action = 'read'),
  1::bigint, 'Tool Pusher retains traceability read');

select is((select count(*)
  from public.rbac_role_permissions rp
  join public.rbac_roles r on r.id = rp.role_id
  join public.rbac_permissions p on p.id = rp.permission_id
  where r.company_id = 'f1000000-0000-0000-0000-000000000001'
    and r.name = 'Tool Pusher'
    and ((p.resource = 'hour-meters' and p.action in ('read', 'register', 'update', 'manage'))
      or (p.resource in ('assets', 'certificates') and p.action in ('read', 'create', 'update', 'delete')))),
  12::bigint, 'Tool Pusher retains hour-meter and CRUD permissions');

select is((select count(*) from public.rbac_permissions where action = 'read' and resource = 'trazabilidad'),
  1::bigint, 'traceability read permission remains in the catalog');
select is((select count(*)
  from public.rbac_role_permissions rp
  join public.rbac_roles r on r.id = rp.role_id
  where r.company_id = 'f1000000-0000-0000-0000-000000000001'
    and r.name in ('Supervisor Electrician', 'Supervisor Mechanic')),
  6::bigint, 'supervisor assignments contain only the six hour-meter permissions');
select ok(not exists (select 1 from public.rbac_role_permissions rp
  join public.rbac_roles r on r.id = rp.role_id
  join public.rbac_permissions p on p.id = rp.permission_id
  where r.company_id = 'f1000000-0000-0000-0000-000000000001'
    and r.name in ('Supervisor Electrician', 'Supervisor Mechanic')
    and p.resource = 'trazabilidad' and p.action <> 'read'),
  'supervisor traceability permissions are otherwise untouched');
select ok(not exists (select 1 from public.rbac_role_permissions rp
  join public.rbac_roles r on r.id = rp.role_id
  join public.rbac_permissions p on p.id = rp.permission_id
  where r.company_id = 'f1000000-0000-0000-0000-000000000001'
    and r.name = 'Tool Pusher'
    and p.resource = 'trazabilidad' and p.action <> 'read'),
  'Tool Pusher traceability permissions are unchanged');

select * from finish();
rollback;
