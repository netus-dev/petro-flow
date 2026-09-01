-- Developer-authorized administration boundary. The browser never receives an unscoped table client.
alter table public.rbac_roles add column if not exists company_id uuid references public.rbac_companies(id) on delete cascade;
update public.rbac_roles set company_id = (select id from public.rbac_companies order by id limit 1) where company_id is null;
alter table public.rbac_roles alter column company_id set not null;
alter table public.rbac_roles drop constraint if exists rbac_roles_name_key;
alter table public.rbac_roles add constraint rbac_roles_company_name_key unique (company_id, name);

create or replace function public.rbac_admin_allowed() returns boolean language sql stable security definer set search_path = '' as $$
  select public.rbac_has_capability(public.rbac_request_company_id(), 'manage', 'access-control')
$$;

create or replace function public.rbac_admin_snapshot() returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
  if not public.rbac_admin_allowed() then raise exception 'access-control administration is forbidden' using errcode = '42501'; end if;
  select jsonb_build_object(
    'roles', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'companyId', company_id)) from public.rbac_roles), '[]'),
    'permissions', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'action', action, 'resource', resource)) from public.rbac_permissions), '[]'),
    'rolePermissions', coalesce((select jsonb_agg(jsonb_build_object('roleId', role_id, 'permissionId', permission_id)) from public.rbac_role_permissions), '[]'),
    'companies', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'isActive', is_active)) from public.rbac_companies), '[]'),
    'users', coalesce((select jsonb_agg(jsonb_build_object('id', p.user_id, 'email', u.email, 'isActive', p.is_active)) from public.rbac_principals p join auth.users u on u.id = p.user_id), '[]'),
    'memberships', coalesce((select jsonb_agg(jsonb_build_object('companyId', company_id, 'userId', user_id, 'isActive', is_active)) from public.rbac_memberships), '[]'),
    'assignments', coalesce((select jsonb_agg(jsonb_build_object('companyId', company_id, 'userId', user_id, 'roleId', role_id)) from public.rbac_assignments), '[]'),
    'entitlements', '[]'::jsonb, 'auditEvents', '[]'::jsonb
  ) into result;
  return result;
end $$;

create or replace function public.rbac_admin_command(p_command jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; kind text := p_command->>'type'; v_company_id uuid := coalesce((p_command->>'companyId')::uuid, (p_command->'membership'->>'companyId')::uuid, (p_command->'assignment'->>'companyId')::uuid, (p_command->'entitlement'->>'companyId')::uuid);
begin
  if not public.rbac_admin_allowed() then raise exception 'access-control administration is forbidden' using errcode = '42501'; end if;
  if kind = 'create-company' then insert into public.rbac_companies(name) values (trim(p_command->'company'->>'name')) returning jsonb_build_object('id', id, 'name', name, 'isActive', is_active) into result;
  elsif kind = 'set-company' then update public.rbac_companies set is_active = (p_command->>'isActive')::boolean where id = v_company_id; result := '{}'::jsonb;
  elsif kind = 'update-company' then update public.rbac_companies set name = trim(p_command->'company'->>'name') where id = v_company_id; result := '{}'::jsonb;
  elsif kind = 'create-role' then insert into public.rbac_roles(name, company_id) values (trim(p_command->'role'->>'name'), v_company_id) returning jsonb_build_object('id', id, 'name', name, 'companyId', company_id) into result;
  elsif kind = 'update-role' then update public.rbac_roles set name = trim(p_command->'role'->>'name') where id = (p_command->>'roleId')::uuid and rbac_roles.company_id = v_company_id; result := '{}'::jsonb;
  elsif kind = 'delete-role' then delete from public.rbac_roles where id = (p_command->>'roleId')::uuid and rbac_roles.company_id = v_company_id; result := '{}'::jsonb;
  elsif kind = 'set-user' then update public.rbac_principals set is_active = (p_command->>'isActive')::boolean where user_id = (p_command->>'userId')::uuid; result := '{}'::jsonb;
  elsif kind = 'set-permission' then delete from public.rbac_role_permissions where role_id = (p_command->>'roleId')::uuid and permission_id = (p_command->>'permissionId')::uuid and exists (select 1 from public.rbac_roles r where r.id = (p_command->>'roleId')::uuid and r.company_id = v_company_id); if (p_command->>'enabled')::boolean then insert into public.rbac_role_permissions select (p_command->>'roleId')::uuid, (p_command->>'permissionId')::uuid where exists (select 1 from public.rbac_roles r where r.id = (p_command->>'roleId')::uuid and r.company_id = v_company_id); end if; result := '{}'::jsonb;
  elsif kind = 'set-membership' then insert into public.rbac_memberships(company_id,user_id,is_active) values (v_company_id,(p_command->'membership'->>'userId')::uuid,(p_command->'membership'->>'isActive')::boolean) on conflict (company_id,user_id) do update set is_active=excluded.is_active; result := '{}'::jsonb;
  elsif kind = 'set-assignment' then insert into public.rbac_assignments(company_id,user_id,role_id) select v_company_id,(p_command->'assignment'->>'userId')::uuid,(p_command->'assignment'->>'roleId')::uuid where exists (select 1 from public.rbac_roles r where r.id = (p_command->'assignment'->>'roleId')::uuid and r.company_id = v_company_id) on conflict do nothing; result := '{}'::jsonb;
  elsif kind = 'remove-membership' then delete from public.rbac_memberships where rbac_memberships.company_id = v_company_id and user_id = (p_command->'membership'->>'userId')::uuid; result := '{}'::jsonb;
  elsif kind = 'remove-assignment' then delete from public.rbac_assignments where rbac_assignments.company_id = v_company_id and user_id = (p_command->'assignment'->>'userId')::uuid and role_id = (p_command->'assignment'->>'roleId')::uuid; result := '{}'::jsonb;
  else raise exception 'unsupported access-control command'; end if;
  return result;
end $$;
revoke all on function public.rbac_admin_snapshot() from public; grant execute on function public.rbac_admin_snapshot() to authenticated;
revoke all on function public.rbac_admin_command(jsonb) from public; grant execute on function public.rbac_admin_command(jsonb) to authenticated;
