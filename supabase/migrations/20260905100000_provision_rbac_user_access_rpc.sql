-- Provision RBAC access for an existing auth user within the active tenant.
create or replace function public.rbac_provision_user_access(
  p_user_id uuid,
  p_role_id uuid,
  p_company_id uuid default null
) returns jsonb
language plpgsql
security definer
set search_path = '' as $$
declare
  v_request_company_id uuid := public.rbac_request_company_id();
  v_company_id uuid := coalesce(p_company_id, v_request_company_id);
begin
  if v_request_company_id is null then
    raise exception 'a valid active company context is required' using errcode = '42501';
  end if;
  if v_company_id is null or v_company_id <> v_request_company_id then
    raise exception 'provisioning company does not match the active tenant' using errcode = '42501';
  end if;
  if not public.rbac_has_capability(v_request_company_id, 'manage', 'access-control', 'access-control') then
    raise exception 'access-control administration is forbidden' using errcode = '42501';
  end if;
  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'provisioning user does not exist' using errcode = '22023';
  end if;
  if not exists (select 1 from public.rbac_companies where id = v_company_id and is_active) then
    raise exception 'provisioning company does not exist or is inactive' using errcode = '22023';
  end if;
  if not exists (select 1 from public.rbac_roles where id = p_role_id and company_id = v_company_id) then
    raise exception 'provisioning role does not belong to the active tenant' using errcode = '22023';
  end if;

  insert into public.rbac_principals(user_id, is_active)
  values (p_user_id, true)
  on conflict (user_id) do update set is_active = true;

  insert into public.rbac_memberships(company_id, user_id, is_active)
  values (v_company_id, p_user_id, true)
  on conflict (company_id, user_id) do update set is_active = true;

  insert into public.rbac_assignments(company_id, user_id, role_id)
  values (v_company_id, p_user_id, p_role_id)
  on conflict (company_id, user_id, role_id) do nothing;

  perform public.rbac_record_audit(
    v_company_id,
    'access_control.user_provisioned',
    'allowed',
    jsonb_build_object('userId', p_user_id, 'roleId', p_role_id)
  );

  return jsonb_build_object(
    'companyId', v_company_id,
    'userId', p_user_id,
    'roleId', p_role_id
  );
end
$$;

revoke all on function public.rbac_provision_user_access(uuid, uuid, uuid) from public, anon, service_role;
grant execute on function public.rbac_provision_user_access(uuid, uuid, uuid) to authenticated;
