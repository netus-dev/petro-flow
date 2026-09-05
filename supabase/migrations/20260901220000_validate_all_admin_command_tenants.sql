-- Reject conflicting tenant identifiers instead of accepting the first JSON field found.
create or replace function public.rbac_admin_command(p_command jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_request_company_id uuid := public.rbac_request_company_id();
  v_company_id uuid;
  kind text := p_command->>'type';
  result jsonb := '{}'::jsonb;
begin
  if v_request_company_id is null then
    raise exception 'a valid active company context is required' using errcode = '42501';
  end if;
  if not public.rbac_has_capability(v_request_company_id, 'manage', 'access-control', 'access-control') then
    raise exception 'access-control administration is forbidden' using errcode = '42501';
  end if;
  if kind not in ('create-role', 'update-role', 'delete-role', 'set-permission', 'set-entitlement', 'set-membership', 'remove-membership', 'set-assignment', 'remove-assignment') then
    raise exception 'unsupported tenant administration command: %', coalesce(kind, 'unknown') using errcode = '0A000';
  end if;

  if ((p_command ? 'companyId') and (p_command->>'companyId')::uuid <> v_request_company_id)
    or ((p_command->'membership' ? 'companyId') and (p_command->'membership'->>'companyId')::uuid <> v_request_company_id)
    or ((p_command->'assignment' ? 'companyId') and (p_command->'assignment'->>'companyId')::uuid <> v_request_company_id)
    or ((p_command->'entitlement' ? 'companyId') and (p_command->'entitlement'->>'companyId')::uuid <> v_request_company_id) then
    raise exception 'command company does not match the active tenant' using errcode = '42501';
  end if;

  v_company_id := coalesce(
    (p_command->>'companyId')::uuid,
    (p_command->'membership'->>'companyId')::uuid,
    (p_command->'assignment'->>'companyId')::uuid,
    (p_command->'entitlement'->>'companyId')::uuid
  );
  if v_company_id is null then
    raise exception 'command company does not match the active tenant' using errcode = '42501';
  end if;

  if kind = 'create-role' then
    insert into public.rbac_roles(name, company_id) values (trim(p_command->'role'->>'name'), v_request_company_id)
    returning jsonb_build_object('id', id, 'name', name, 'companyId', company_id) into result;
  elsif kind = 'update-role' then
    update public.rbac_roles set name = trim(p_command->'role'->>'name') where id = (p_command->>'roleId')::uuid and company_id = v_request_company_id;
  elsif kind = 'delete-role' then
    delete from public.rbac_roles where id = (p_command->>'roleId')::uuid and company_id = v_request_company_id;
  elsif kind = 'set-permission' then
    delete from public.rbac_role_permissions where role_id = (p_command->>'roleId')::uuid and permission_id = (p_command->>'permissionId')::uuid and exists (select 1 from public.rbac_roles r where r.id = (p_command->>'roleId')::uuid and r.company_id = v_request_company_id);
    if (p_command->>'enabled')::boolean then
      insert into public.rbac_role_permissions(role_id, permission_id)
      select (p_command->>'roleId')::uuid, (p_command->>'permissionId')::uuid
      where exists (select 1 from public.rbac_roles r where r.id = (p_command->>'roleId')::uuid and r.company_id = v_request_company_id);
    end if;
  elsif kind = 'set-entitlement' then
    insert into public.rbac_company_modules(company_id, module_key, enabled)
    values (v_request_company_id, p_command->'entitlement'->>'moduleKey', (p_command->'entitlement'->>'enabled')::boolean)
    on conflict (company_id, module_key) do update set enabled = excluded.enabled;
  elsif kind = 'set-membership' then
    insert into public.rbac_memberships(company_id, user_id, is_active)
    values (v_request_company_id, (p_command->'membership'->>'userId')::uuid, (p_command->'membership'->>'isActive')::boolean)
    on conflict (company_id, user_id) do update set is_active = excluded.is_active;
  elsif kind = 'remove-membership' then
    delete from public.rbac_memberships where company_id = v_request_company_id and user_id = (p_command->'membership'->>'userId')::uuid;
  elsif kind = 'set-assignment' then
    insert into public.rbac_assignments(company_id, user_id, role_id)
    select v_request_company_id, (p_command->'assignment'->>'userId')::uuid, (p_command->'assignment'->>'roleId')::uuid
    where exists (select 1 from public.rbac_roles r where r.id = (p_command->'assignment'->>'roleId')::uuid and r.company_id = v_request_company_id)
    on conflict do nothing;
  elsif kind = 'remove-assignment' then
    delete from public.rbac_assignments where company_id = v_request_company_id and user_id = (p_command->'assignment'->>'userId')::uuid and role_id = (p_command->'assignment'->>'roleId')::uuid;
  end if;
  return result;
end
$$;

revoke all on function public.rbac_admin_command(jsonb) from public, anon, service_role;
grant execute on function public.rbac_admin_command(jsonb) to authenticated;
