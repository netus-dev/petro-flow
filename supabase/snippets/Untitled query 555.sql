-- 1. Principal
insert into public.rbac_principals (user_id, is_active)
values ('9a70b07e-1868-41a0-b8e9-d32bfb4af12f', true)
on conflict (user_id) do update
set is_active = true;

-- 2. Membership con la empresa activa
insert into public.rbac_memberships (user_id, company_id, is_active)
values (
  '9a70b07e-1868-41a0-b8e9-d32bfb4af12f',
  '92000000-0000-0000-0000-000000000001',
  true
)
on conflict (user_id, company_id) do update
set is_active = true;

-- 3. Rol dentro de esa empresa
insert into public.rbac_assignments (user_id, company_id, role_id)
values (
  '9a70b07e-1868-41a0-b8e9-d32bfb4af12f',
  '92000000-0000-0000-0000-000000000001',
  '93000000-0000-0000-0000-000000000001' -- seed-manager
)
on conflict (user_id, company_id, role_id) do nothing;