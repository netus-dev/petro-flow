-- Production baseline for Perforadora Integral de Oriente Ixachi.
-- Intentionally does not create users, memberships, or assignments.
do $$
declare v_company_id uuid := 'f1000000-0000-0000-0000-000000000001';
begin
  insert into public.rbac_companies (id, name, is_active) values (v_company_id, 'Perforadora Integral de Oriente Ixachi', true)
  on conflict (id) do update set name = excluded.name, is_active = excluded.is_active;
  insert into public.rbac_company_modules (company_id, module_key, enabled) values
    (v_company_id, 'hour-meters', true), (v_company_id, 'trazabilidad', true), (v_company_id, 'access-control', true)
  on conflict (company_id, module_key) do update set enabled = excluded.enabled;
  insert into public.rbac_roles (id, company_id, name) values
    ('f2000000-0000-0000-0000-000000000001', v_company_id, 'Supervisor Electrician'),
    ('f2000000-0000-0000-0000-000000000002', v_company_id, 'Supervisor Mechanic'),
    ('f2000000-0000-0000-0000-000000000003', v_company_id, 'Tool Pusher')
  on conflict (id) do update set company_id = excluded.company_id, name = excluded.name;
end $$;

insert into public.rbac_permissions (id, action, resource) values
  (gen_random_uuid(), 'read', 'trazabilidad')
on conflict (action, resource) do nothing;

insert into public.rbac_role_permissions (role_id, permission_id)
select r.id, p.id from public.rbac_roles r cross join public.rbac_permissions p
where r.name in ('Supervisor Electrician', 'Supervisor Mechanic') and p.resource = 'hour-meters' and p.action in ('read', 'register', 'update')
on conflict do nothing;
insert into public.rbac_role_permissions (role_id, permission_id)
select r.id, p.id from public.rbac_roles r cross join public.rbac_permissions p
where r.name = 'Tool Pusher' and ((p.resource = 'hour-meters' and p.action in ('read', 'register', 'update', 'manage')) or (p.resource in ('assets', 'certificates') and p.action in ('read', 'create', 'update', 'delete')))
on conflict do nothing;
insert into public.rbac_role_permissions (role_id, permission_id)
select r.id, p.id from public.rbac_roles r cross join public.rbac_permissions p
where r.name in ('Supervisor Electrician', 'Supervisor Mechanic', 'Tool Pusher') and p.resource = 'trazabilidad' and p.action = 'read'
on conflict do nothing;

insert into public.locations (id, name, type, company_id, is_active) values
  ('f4000000-0000-0000-0000-000000000001', 'Rig 702', 'rig', 'f1000000-0000-0000-0000-000000000001', true),
  ('f4000000-0000-0000-0000-000000000002', 'Rig 703', 'rig', 'f1000000-0000-0000-0000-000000000001', true)
on conflict (id) do update set name = excluded.name, type = excluded.type, company_id = excluded.company_id, is_active = excluded.is_active;

do $$
declare b record; v_brand_id uuid; ixachi_id uuid := 'f1000000-0000-0000-0000-000000000001';
begin
  for b in select * from (values
    ('SICHUAN HONGUA PETROLEUM EQUIPMENT CO, LTD.', 'HH-2400'), ('KATO ENGINEERING', 'AA27647035'), ('CATERPILLAR', '3512C'),
    ('GLOBAL DRILLING SUPPORT', 'GDM-850 AC'), ('AMERICAN BLOCK', '35770000-H'), ('CANRIG', 'PC3000-42-A-A-A-N-S'),
    ('NATIONAL OILWELL VARCO', 'ST-100'), ('NATIONAL OILWELL VARCO', '2B604808B15T32A-P')
  ) as x(brand_name, model_name) loop
    select id into v_brand_id from public.brands where name = b.brand_name and company_id = ixachi_id limit 1;
    if v_brand_id is null then insert into public.brands (name, company_id) values (b.brand_name, ixachi_id) returning id into v_brand_id; end if;
    if not exists (select 1 from public.models where name = b.model_name and brand_id = v_brand_id and company_id = ixachi_id) then
      insert into public.models (name, brand_id, company_id) values (b.model_name, v_brand_id, ixachi_id);
    end if;
  end loop;
end $$;
