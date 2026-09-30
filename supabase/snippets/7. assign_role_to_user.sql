-- Grant catalog reading to the Tool Pusher role and enable the company-level operations module.
-- The module enablement is company-wide; it is not a role permission. Role capabilities still gate access.
do $$
declare
  v_company_id uuid := 'f1000000-0000-0000-0000-000000000001';
  v_role_name text := 'Tool Pusher';
  v_target_email text := 'tp.703@perforadoraixachi.mx';
  v_role_id uuid;
  v_target_user_id uuid;
  v_permission_id uuid;
begin
  select id into v_role_id
  from public.rbac_roles
  where company_id = v_company_id and name = v_role_name;
  if v_role_id is null then raise exception 'Role was not found: %', v_role_name; end if;

  select id into v_target_user_id from auth.users where email = v_target_email;
  if v_target_user_id is null then raise exception 'User was not found: %', v_target_email; end if;

  insert into public.rbac_company_modules (company_id, module_key, enabled)
  values (v_company_id, 'operations', true)
  on conflict (company_id, module_key) do update set enabled = excluded.enabled;

  insert into public.rbac_permissions (action, resource)
  values ('read', 'catalogs')
  on conflict (action, resource) do update set resource = excluded.resource
  returning id into v_permission_id;

  insert into public.rbac_role_permissions (role_id, permission_id)
  values (v_role_id, v_permission_id)
  on conflict do nothing;

  insert into public.rbac_assignments (user_id, company_id, role_id)
  values (v_target_user_id, v_company_id, v_role_id)
  on conflict do nothing;
end $$;
