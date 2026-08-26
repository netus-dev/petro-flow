-- Local-only deterministic RBAC seed. Never use this file against a remote database.
-- All identities, labels, paths, and UUIDs are synthetic and disposable.

insert into auth.users (id, email, aud, role)
values
  ('91000000-0000-0000-0000-000000000001', 'seed-admin@example.test', 'authenticated', 'authenticated'),
  ('91000000-0000-0000-0000-000000000002', 'seed-peer@example.test', 'authenticated', 'authenticated'),
  ('91000000-0000-0000-0000-000000000003', 'seed-inactive@example.test', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into public.rbac_principals (user_id, is_active) values
  ('91000000-0000-0000-0000-000000000001', true),
  ('91000000-0000-0000-0000-000000000002', true),
  ('91000000-0000-0000-0000-000000000003', false)
on conflict (user_id) do update set is_active = excluded.is_active;

insert into public.rbac_companies (id, name, is_active) values
  ('92000000-0000-0000-0000-000000000001', 'Seed Company North', true),
  ('92000000-0000-0000-0000-000000000002', 'Seed Company South', false)
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
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', true),
  ('92000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000001', true),
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000002', true),
  ('92000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000003', false)
on conflict (company_id, user_id) do update set is_active = excluded.is_active;

insert into public.rbac_assignments (company_id, user_id, role_id) values
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', '93000000-0000-0000-0000-000000000001'),
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000002', '93000000-0000-0000-0000-000000000002')
on conflict do nothing;

insert into public.rbac_company_modules (company_id, module_key, enabled) values
  ('92000000-0000-0000-0000-000000000001', 'operations', true),
  ('92000000-0000-0000-0000-000000000002', 'operations', true)
on conflict (company_id, module_key) do update set enabled = excluded.enabled;

insert into public.rbac_documents (id, company_id, body) values
  ('95000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000001', '{"fixture":"north"}'),
  ('95000000-0000-0000-0000-000000000002', '92000000-0000-0000-0000-000000000002', '{"fixture":"south"}')
on conflict (id) do update set body = excluded.body;

insert into public.locations (id, name, location_type) values
  ('96000000-0000-0000-0000-000000000001', 'Seed Yard', 'operating_base')
on conflict (id) do nothing;
insert into public.functional_principles (id, name) values
  ('97000000-0000-0000-0000-000000000001', 'Seed Equipment')
on conflict (id) do nothing;
insert into public.assets (id, current_location_id, function_principle_id, is_active) values
  ('98000000-0000-0000-0000-000000000001', '96000000-0000-0000-0000-000000000001', '97000000-0000-0000-0000-000000000001', true)
on conflict (id) do nothing;
insert into public.certificates (id, asset_id, storage_path, uploaded_by) values
  ('99000000-0000-0000-0000-000000000001', '98000000-0000-0000-0000-000000000001', 'seed/valid-document.pdf', '91000000-0000-0000-0000-000000000001'),
  ('99000000-0000-0000-0000-000000000002', '98000000-0000-0000-0000-000000000001', 'seed/path-mismatch.pdf', '91000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;
insert into storage.objects (id, bucket_id, name, owner, metadata) values
  ('9a000000-0000-0000-0000-000000000001', 'certificates', 'seed/valid-document.pdf', '91000000-0000-0000-0000-000000000001', '{"mimetype":"application/pdf"}'),
  ('9a000000-0000-0000-0000-000000000002', 'certificates', 'seed/path-mismatch.pdf', '91000000-0000-0000-0000-000000000002', '{"mimetype":"application/pdf"}')
on conflict (id) do nothing;
