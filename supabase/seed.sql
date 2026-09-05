-- Local-only deterministic RBAC seed. Never use this file against a remote database.
-- All identities, labels, paths, and UUIDs are synthetic and disposable.

insert into auth.users (id, email, aud, role)
values
  ('91000000-0000-0000-0000-000000000001', 'seed-admin@example.test', 'authenticated', 'authenticated'),
  ('91000000-0000-0000-0000-000000000002', 'seed-peer@example.test', 'authenticated', 'authenticated'),
  ('91000000-0000-0000-0000-000000000003', 'seed-inactive@example.test', 'authenticated', 'authenticated'),
  ('91000000-0000-0000-0000-000000000004', 'hola@oalonsodev.com', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into public.rbac_principals (user_id, is_active) values
  ('91000000-0000-0000-0000-000000000001', true),
  ('91000000-0000-0000-0000-000000000002', true),
  ('91000000-0000-0000-0000-000000000003', false)
on conflict (user_id) do update set is_active = excluded.is_active;

insert into public.rbac_companies (id, name, is_active) values
  ('92000000-0000-0000-0000-000000000001', 'Seed Company North', true),
  ('92000000-0000-0000-0000-000000000002', 'Seed Company South', false),
  ('92000000-0000-0000-0000-000000000004', 'Hour Meters Test', true),
  ('a2000000-0000-0000-0000-000000000001', 'Legacy Test North', true),
  ('a2000000-0000-0000-0000-000000000002', 'Legacy Test South', false)
on conflict (id) do update set name = excluded.name, is_active = excluded.is_active;

insert into public.rbac_roles (id, name, company_id) values
  ('93000000-0000-0000-0000-000000000001', 'seed-manager', '92000000-0000-0000-0000-000000000001'),
  ('93000000-0000-0000-0000-000000000002', 'seed-reader', '92000000-0000-0000-0000-000000000001'),
  ('93000000-0000-0000-0000-000000000003', 'seed-manager', '92000000-0000-0000-0000-000000000002')
on conflict (id) do update set name = excluded.name, company_id = excluded.company_id;

insert into public.rbac_permissions (id, action, resource) values
  ('94000000-0000-0000-0000-000000000001', 'read', 'documents'),
  ('94000000-0000-0000-0000-000000000002', 'update', 'documents'),
  ('94000000-0000-0000-0000-000000000003', 'manage', 'access-control'),
  ('9a000000-0000-0000-0000-000000000001', 'read', 'hour-meters'),
  ('9a000000-0000-0000-0000-000000000002', 'register', 'hour-meters'),
  ('9a000000-0000-0000-0000-000000000003', 'update', 'hour-meters'),
  ('9a000000-0000-0000-0000-000000000004', 'read', 'certificates')
on conflict (id) do update set action = excluded.action, resource = excluded.resource;

insert into public.rbac_role_permissions (role_id, permission_id) values
  ('93000000-0000-0000-0000-000000000001', '94000000-0000-0000-0000-000000000001'),
  ('93000000-0000-0000-0000-000000000001', '94000000-0000-0000-0000-000000000002'),
  ('93000000-0000-0000-0000-000000000001', '94000000-0000-0000-0000-000000000003'),
  ('93000000-0000-0000-0000-000000000001', '9a000000-0000-0000-0000-000000000004'),
  ('93000000-0000-0000-0000-000000000002', '94000000-0000-0000-0000-000000000001'),
  ('93000000-0000-0000-0000-000000000003', '94000000-0000-0000-0000-000000000001')
on conflict do nothing;

insert into public.rbac_memberships (company_id, user_id, is_active) values
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', true),
  ('92000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000001', true),
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000002', true),
  ('92000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000003', false)
on conflict (company_id, user_id) do update set is_active = excluded.is_active;

insert into public.rbac_assignments (company_id, user_id, role_id) values
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', '93000000-0000-0000-0000-000000000001'),
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000002', '93000000-0000-0000-0000-000000000002')
on conflict do nothing;

insert into public.rbac_principals (user_id, is_active) values
  ('91000000-0000-0000-0000-000000000004', true)
on conflict (user_id) do update set is_active = excluded.is_active;

insert into public.rbac_roles (id, name, company_id) values
  ('93000000-0000-0000-0000-000000000004', 'developer', '92000000-0000-0000-0000-000000000004')
on conflict (id) do update set name = excluded.name, company_id = excluded.company_id;
insert into public.rbac_memberships (company_id, user_id, is_active) values
  ('92000000-0000-0000-0000-000000000004', '91000000-0000-0000-0000-000000000004', true)
on conflict (company_id, user_id) do update set is_active = excluded.is_active;
insert into public.rbac_assignments (company_id, user_id, role_id) values
  ('92000000-0000-0000-0000-000000000004', '91000000-0000-0000-0000-000000000004', '93000000-0000-0000-0000-000000000004')
on conflict do nothing;
insert into public.rbac_role_permissions (role_id, permission_id) values
  ('93000000-0000-0000-0000-000000000004', '94000000-0000-0000-0000-000000000003'),
  ('93000000-0000-0000-0000-000000000004', '9a000000-0000-0000-0000-000000000001'),
  ('93000000-0000-0000-0000-000000000004', '9a000000-0000-0000-0000-000000000002'),
  ('93000000-0000-0000-0000-000000000004', '9a000000-0000-0000-0000-000000000003')
on conflict do nothing;

insert into public.hourmeters_settings (company_id)
values ('92000000-0000-0000-0000-000000000004')
on conflict (company_id) do nothing;

insert into public.rbac_companies (id, name, is_active) values
  ('a2000000-0000-0000-0000-000000000001', 'Legacy Test North', true),
  ('a2000000-0000-0000-0000-000000000002', 'Legacy Test South', false)
on conflict (id) do update set name = excluded.name, is_active = excluded.is_active;

insert into public.rbac_company_modules (company_id, module_key, enabled) values
  ('92000000-0000-0000-0000-000000000004', 'hour-meters', true),
  ('92000000-0000-0000-0000-000000000004', 'access-control', true)
on conflict (company_id, module_key) do update set enabled = excluded.enabled;

insert into public.locations (id, name, type, company_id, is_active) values
  ('b7000000-0000-0000-0000-000000000001', 'Hour Meters Yard', 'operating_base', '92000000-0000-0000-0000-000000000004', true)
on conflict (id) do update set name = excluded.name, type = excluded.type, company_id = excluded.company_id, is_active = excluded.is_active;

do $$ declare c_id uuid; u_id uuid; rig_id uuid; rig_name text; begin
  c_id := '92000000-0000-0000-0000-000000000004';
  u_id := '91000000-0000-0000-0000-000000000004';
  foreach rig_name in array array['Rig 702', 'Rig 703'] loop
    select id into rig_id from public.locations where locations.company_id = c_id and locations.type::text = 'rig' and locations.name = rig_name limit 1;
    if rig_id is null then
      insert into public.locations (id, name, type, company_id, is_active) values (gen_random_uuid(), rig_name, 'rig'::public.location_type, c_id, true) returning id into rig_id;
      insert into public.rigs (id) values (rig_id);
    end if;
    insert into public.rbac_operational_scopes (company_id, user_id) values (c_id, u_id) on conflict do nothing;
    insert into public.rbac_operational_scope_rigs (company_id, user_id, rig_id) values (c_id, u_id, rig_id) on conflict do nothing;
  end loop;
end $$;

do $$
declare
  c_id uuid := '92000000-0000-0000-0000-000000000004';
  rig_id uuid;
  yard_id uuid;
  principle_id uuid;
  ubication_id uuid;
  asset_id uuid;
  asset_name text;
  principle_name text;
  i integer;
  names text[] := array['Bomba de Lodo 1','Bomba de Lodo 2','Bomba de Lodo 3','Malacate','Top Drive','Unidad de Potencia Hidráulica','Bomba para Operar Preventores'];
  principles text[] := array['Bomba de Lodo','Bomba de Lodo','Bomba de Lodo','Malacate','Top Drive','Unidad de Potencia Hidráulica','Bomba para Operar Preventores'];
begin
  select id into rig_id from public.locations where company_id = c_id and type::text = 'rig' and name = 'Rig 702' limit 1;
  select id into yard_id from public.locations where company_id = c_id and type::text = 'operating_base' and name = 'Hour Meters Yard' limit 1;
  if rig_id is null then
    raise exception 'Rig 702 was not created for Hour Meters Test';
  end if;

  for i in 1..5 loop
    asset_name := 'Motor del generador ' || i;
    principle_name := 'Motor de Combustión Interna';
    select id into principle_id from public.functional_principles where company_id = c_id and name = principle_name limit 1;
    if principle_id is null then
      insert into public.functional_principles (id, name, company_id) values (gen_random_uuid(), principle_name, c_id) returning id into principle_id;
    end if;
    select id into ubication_id from public.ubications where company_id = c_id and name = asset_name limit 1;
    if ubication_id is null then insert into public.ubications (name, company_id) values (asset_name, c_id) returning id into ubication_id; end if;
    asset_id := ('b8000000-0000-0000-0000-' || lpad((i)::text, 12, '0'))::uuid;
    insert into public.assets (id, company_id, current_location_id, function_principle_id, current_ubication_id, is_active)
      values (asset_id, c_id, rig_id, principle_id, ubication_id, true)
      on conflict (id) do update set company_id = excluded.company_id, current_location_id = excluded.current_location_id, function_principle_id = excluded.function_principle_id, current_ubication_id = excluded.current_ubication_id, is_active = true;
  end loop;

  for i in 1..7 loop
    asset_name := names[i];
    principle_name := principles[i];
    select id into principle_id from public.functional_principles where company_id = c_id and name = principle_name limit 1;
    if principle_id is null then insert into public.functional_principles (id, name, company_id) values (gen_random_uuid(), principle_name, c_id) returning id into principle_id; end if;
    select id into ubication_id from public.ubications where company_id = c_id and name = asset_name limit 1;
    if ubication_id is null then insert into public.ubications (name, company_id) values (asset_name, c_id) returning id into ubication_id; end if;
    asset_id := ('b8000000-0000-0000-0000-' || lpad((5 + i)::text, 12, '0'))::uuid;
    insert into public.assets (id, company_id, current_location_id, function_principle_id, current_ubication_id, is_active)
      values (asset_id, c_id, rig_id, principle_id, ubication_id, true)
      on conflict (id) do update set company_id = excluded.company_id, current_location_id = excluded.current_location_id, function_principle_id = excluded.function_principle_id, current_ubication_id = excluded.current_ubication_id, is_active = true;
  end loop;
end $$;

insert into public.rbac_company_modules (company_id, module_key, enabled) values
  ('92000000-0000-0000-0000-000000000001', 'operations', true),
  ('92000000-0000-0000-0000-000000000002', 'operations', true)
on conflict (company_id, module_key) do update set enabled = excluded.enabled;

insert into public.rbac_documents (id, company_id, body) values
  ('95000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000001', '{"fixture":"north"}'),
  ('95000000-0000-0000-0000-000000000002', '92000000-0000-0000-0000-000000000002', '{"fixture":"south"}')
on conflict (id) do update set body = excluded.body;

insert into public.locations (id, name, type, company_id) values
  ('96000000-0000-0000-0000-000000000001', 'Seed Yard', 'operating_base', '92000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;
insert into public.functional_principles (id, name, company_id) values
  ('97000000-0000-0000-0000-000000000001', 'Seed Equipment', '92000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;
insert into public.assets (id, company_id, current_location_id, function_principle_id, is_active) values
  ('98000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000001', '96000000-0000-0000-0000-000000000001', '97000000-0000-0000-0000-000000000001', true)
on conflict (id) do nothing;
insert into public.certificates (id, company_id, storage_path, uploaded_by) values
  ('99000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000001', 'seed/valid-document.pdf', '91000000-0000-0000-0000-000000000001'),
  ('99000000-0000-0000-0000-000000000002', '92000000-0000-0000-0000-000000000001', 'seed/path-mismatch.pdf', '91000000-0000-0000-0000-000000000001'),
  ('a5000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000001', 'seed/legacy-reference.pdf', 'a1000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;
insert into storage.objects (id, bucket_id, name, owner, metadata) values
  ('9a000000-0000-0000-0000-000000000001', 'certificates', 'seed/valid-document.pdf', '91000000-0000-0000-0000-000000000001', '{"mimetype":"application/pdf"}'),
  ('9a000000-0000-0000-0000-000000000002', 'certificates', 'seed/path-mismatch.pdf', '91000000-0000-0000-0000-000000000002', '{"mimetype":"application/pdf"}'),
  ('a6000000-0000-0000-0000-000000000001', 'certificates', 'seed/legacy-reference.pdf', 'a1000000-0000-0000-0000-000000000001', '{"mimetype":"application/pdf"}')
 on conflict (id) do nothing;
