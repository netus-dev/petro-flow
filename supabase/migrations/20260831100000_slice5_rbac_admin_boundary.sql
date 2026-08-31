-- Slice 5: there is no platform-admin role and the current schema has global
-- permissions. Roles are tenant-scoped by the earlier explicit RBAC contract;
-- the permission dictionary remains global and inaccessible to web tenants.
do $$
begin
  execute 'drop policy if exists rbac_companies_admin on public.rbac_companies';
  execute 'drop policy if exists rbac_roles_admin on public.rbac_roles';
  execute 'drop policy if exists rbac_permissions_admin on public.rbac_permissions';
  execute 'drop policy if exists rbac_role_permissions_admin on public.rbac_role_permissions';
end
$$;

revoke all on public.rbac_companies, public.rbac_roles,
  public.rbac_permissions, public.rbac_role_permissions from authenticated;

create policy rbac_roles_admin on public.rbac_roles for all to authenticated
using (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'manage', 'access-control')
)
with check (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'manage', 'access-control')
);

grant select, insert, update, delete on public.rbac_roles to authenticated;

create policy rbac_role_permissions_admin on public.rbac_role_permissions for all to authenticated
using (
  exists (
    select 1 from public.rbac_roles r
    where r.id = role_id and r.company_id = public.rbac_request_company_id()
  )
  and public.rbac_has_capability(public.rbac_request_company_id(), 'manage', 'access-control')
)
with check (
  exists (
    select 1 from public.rbac_roles r
    where r.id = role_id and r.company_id = public.rbac_request_company_id()
  )
  and public.rbac_has_capability(public.rbac_request_company_id(), 'manage', 'access-control')
);

grant select, insert, delete on public.rbac_role_permissions to authenticated;

grant select on public.rbac_companies to authenticated;
grant select, insert, update, delete on public.rbac_memberships,
  public.rbac_assignments, public.rbac_company_modules to authenticated;

-- Tenant writes remain bounded by company_id and the active request context.
drop policy if exists rbac_assignments_admin on public.rbac_assignments;
create policy rbac_assignments_admin on public.rbac_assignments for all to authenticated
using (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'manage', 'access-control')
)
with check (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'manage', 'access-control')
);

create or replace function public.rbac_record_audit(
  p_company_id uuid, p_event_type text, p_outcome text, p_target jsonb default '{}'::jsonb
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    if p_company_id is null
       or public.rbac_request_company_id() is null
       or p_company_id <> public.rbac_request_company_id()
       or not public.rbac_renew_authorization(p_company_id)
       or not public.rbac_has_capability(p_company_id, 'manage', 'access-control') then
      raise exception 'audit company must match an active request company' using errcode = '42501';
    end if;
  end if;

  insert into public.rbac_audit_events(actor_id, company_id, event_type, outcome, target)
  values (auth.uid(), p_company_id, p_event_type, p_outcome, p_target);
end
$$;
