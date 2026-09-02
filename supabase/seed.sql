-- Local-only deterministic RBAC seed. Never use this file against a remote database.
-- All identities, labels, paths, and UUIDs are synthetic and disposable.

insert into auth.users (id, email, aud, role)
values
  ('91000000-0000-0000-0000-000000000001', 'seed-admin@example.test', 'authenticated', 'authenticated'),
  ('91000000-0000-0000-0000-000000000002', 'seed-peer@example.test', 'authenticated', 'authenticated'),
  ('91000000-0000-0000-0000-000000000003', 'seed-inactive@example.test', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.users (id, email, aud, role, encrypted_password, email_confirmed_at)
values ('91000000-0000-0000-0000-000000000004', 'hola@oalonsodev.com', 'authenticated', 'authenticated', '$2a$10$nLYP9uy0XhBovuKcp7lyMOxnm/SHwvgSW/eySK1fXh2rKNs60gjdS', now())
on conflict (id) do update set email = excluded.email, encrypted_password = excluded.encrypted_password, email_confirmed_at = excluded.email_confirmed_at;

-- The auth trigger creates onboarding profiles. Complete these synthetic profiles
-- without making the trigger provision memberships or roles.
update public.users
set name = case id
    when '91000000-0000-0000-0000-000000000001' then 'Seed Admin'
    when '91000000-0000-0000-0000-000000000002' then 'Seed Peer'
    else 'Seed Inactive'
  end,
  is_active = id <> '91000000-0000-0000-0000-000000000003'::uuid
where id in (
  '91000000-0000-0000-0000-000000000001',
  '91000000-0000-0000-0000-000000000002',
  '91000000-0000-0000-0000-000000000003'
);

-- Synthetic legacy cohort used only to rehearse company FK repointing and
-- removal of the legacy profile membership field. It is separate from canonical RBAC fixtures.
insert into auth.users (id, email, aud, role) values
  ('a1000000-0000-0000-0000-000000000001', 'legacy-admin@example.test', 'authenticated', 'authenticated'),
  ('a1000000-0000-0000-0000-000000000002', 'legacy-operator@example.test', 'authenticated', 'authenticated'),
  ('a1000000-0000-0000-0000-000000000003', 'legacy-inactive@example.test', 'authenticated', 'authenticated')
on conflict (id) do nothing;
insert into public.companies (id, name, description, is_active) values
  ('a2000000-0000-0000-0000-000000000001', 'Legacy Test North', 'Synthetic legacy company.', true),
  ('a2000000-0000-0000-0000-000000000002', 'Legacy Test South', 'Synthetic inactive legacy company.', false)
on conflict (id) do update set name = excluded.name, description = excluded.description, is_active = excluded.is_active;
insert into public.users (id, name, email, job_position, is_active) values
  ('a1000000-0000-0000-0000-000000000001', 'Legacy Seed Admin', 'legacy-admin@example.test', 'Administrator', true),
  ('a1000000-0000-0000-0000-000000000002', 'Legacy Seed Operator', 'legacy-operator@example.test', 'Operator', true),
  ('a1000000-0000-0000-0000-000000000003', 'Legacy Seed Inactive', 'legacy-inactive@example.test', 'Operator', false)
on conflict (id) do update set name = excluded.name, email = excluded.email, job_position = excluded.job_position, is_active = excluded.is_active;
insert into public.roles (id, name, description, company_id) values
  ('a3000000-0000-0000-0000-000000000001', 'legacy-manager', 'Synthetic legacy manager role.', 'a2000000-0000-0000-0000-000000000001'),
  ('a3000000-0000-0000-0000-000000000002', 'legacy-viewer', 'Synthetic legacy viewer role.', 'a2000000-0000-0000-0000-000000000002')
on conflict (id) do update set name = excluded.name, description = excluded.description, company_id = excluded.company_id;
insert into public.permissions (id, name, company_id, is_custom) values
  ('a4000000-0000-0000-0000-000000000001', 'read.legacy-documents', 'a2000000-0000-0000-0000-000000000001', true),
  ('a4000000-0000-0000-0000-000000000002', 'update.legacy-documents', 'a2000000-0000-0000-0000-000000000002', true)
on conflict (id) do update set name = excluded.name, company_id = excluded.company_id, is_custom = excluded.is_custom;
insert into public.role_permissions (role_id, permission_id) values
  ('a3000000-0000-0000-0000-000000000001', 'a4000000-0000-0000-0000-000000000001'),
  ('a3000000-0000-0000-0000-000000000002', 'a4000000-0000-0000-0000-000000000002')
on conflict do nothing;
insert into public.user_roles (user_id, role_id) values
  ('a1000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000002')
on conflict do nothing;

insert into public.rbac_principals (user_id, is_active) values
  ('a1000000-0000-0000-0000-000000000001', true),
  ('a1000000-0000-0000-0000-000000000002', true),
  ('a1000000-0000-0000-0000-000000000003', false),
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
  ('94000000-0000-0000-0000-000000000003', 'manage', 'access-control')
on conflict (id) do update set action = excluded.action, resource = excluded.resource;

insert into public.rbac_role_permissions (role_id, permission_id) values
  ('93000000-0000-0000-0000-000000000001', '94000000-0000-0000-0000-000000000001'),
  ('93000000-0000-0000-0000-000000000001', '94000000-0000-0000-0000-000000000002'),
  ('93000000-0000-0000-0000-000000000001', '94000000-0000-0000-0000-000000000003'),
  ('93000000-0000-0000-0000-000000000002', '94000000-0000-0000-0000-000000000001'),
  ('93000000-0000-0000-0000-000000000003', '94000000-0000-0000-0000-000000000001')
on conflict do nothing;

insert into public.rbac_memberships (company_id, user_id, is_active) values
  ('a2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', true),
  ('a2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', true),
  ('a2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', false),
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

insert into public.companies (id, name, description, is_active) values
  ('92000000-0000-0000-0000-000000000004', 'Hour Meters Test', 'Local Hour Meters fixture.', true)
on conflict (id) do update set name = excluded.name, description = excluded.description, is_active = excluded.is_active;

insert into public.hourmeters_settings (company_id)
values ('92000000-0000-0000-0000-000000000004')
on conflict (company_id) do nothing;

insert into public.users (id, name, email, job_position, is_active, company_id) values
  ('91000000-0000-0000-0000-000000000004', 'Hour Meters Developer', 'hola@oalonsodev.com', 'Developer', true, '92000000-0000-0000-0000-000000000004')
on conflict (id) do update set name = excluded.name, email = excluded.email, job_position = excluded.job_position, is_active = excluded.is_active, company_id = excluded.company_id;

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

-- Run the rehearsal after the synthetic legacy cohort is present. The function
-- uses a transaction-scoped preflight table and retains no exception ledger.
select public.rbac_rehearse_legacy_consolidation();
select public.rbac_rehearse_company_fk_repoint();
select public.rbac_rehearse_remove_users_company_id();
select public.rbac_rehearse_retire_companies();
