-- Database-authoritative RBAC. Browser company selection is intentionally not stored here.
create table public.rbac_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true
);
create table public.rbac_principals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default true
);
create table public.rbac_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  company_id uuid
);
create table public.rbac_permissions (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  resource text not null,
  unique (action, resource)
);
create table public.rbac_role_permissions (
  role_id uuid not null references public.rbac_roles(id) on delete cascade,
  permission_id uuid not null references public.rbac_permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);
create table public.rbac_memberships (
  company_id uuid not null references public.rbac_companies(id) on delete cascade,
  user_id uuid not null references public.rbac_principals(user_id) on delete cascade,
  is_active boolean not null default true,
  primary key (company_id, user_id)
);
create table public.rbac_assignments (
  company_id uuid not null,
  user_id uuid not null,
  role_id uuid not null references public.rbac_roles(id) on delete cascade,
  primary key (company_id, user_id, role_id),
  foreign key (company_id, user_id)
    references public.rbac_memberships(company_id, user_id) on delete cascade
);
create table public.rbac_company_modules (
  company_id uuid not null references public.rbac_companies(id) on delete cascade,
  module_key text not null,
  enabled boolean not null default false,
  primary key (company_id, module_key)
);
create table public.rbac_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.rbac_companies(id) on delete cascade,
  body jsonb not null default '{}'::jsonb
);
create table public.rbac_audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid,
  company_id uuid,
  event_type text not null,
  outcome text not null check (outcome in ('allowed', 'denied')),
  target jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.rbac_companies enable row level security;
alter table public.rbac_principals enable row level security;
alter table public.rbac_roles enable row level security;
alter table public.rbac_permissions enable row level security;
alter table public.rbac_role_permissions enable row level security;
alter table public.rbac_memberships enable row level security;
alter table public.rbac_assignments enable row level security;
alter table public.rbac_company_modules enable row level security;
alter table public.rbac_documents enable row level security;
alter table public.rbac_audit_events enable row level security;

create function public.rbac_request_company_id() returns uuid
language sql stable set search_path = '' as $$
  select nullif(current_setting('request.headers', true)::jsonb ->> 'x-company-id', '')::uuid
$$;

create function public.rbac_renew_authorization(p_company_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.rbac_principals p
    join public.rbac_memberships m on m.user_id = p.user_id
    join public.rbac_companies c on c.id = m.company_id
    where p.user_id = auth.uid() and p.is_active and m.is_active
      and c.is_active and c.id = p_company_id
  )
$$;

create function public.rbac_has_capability(
  p_company_id uuid, p_action text, p_resource text, p_module_key text default null
) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.rbac_renew_authorization(p_company_id)
    and (p_module_key is null or exists (
      select 1 from public.rbac_company_modules cm
      where cm.company_id = p_company_id and cm.module_key = p_module_key and cm.enabled
    ))
    and exists (
      select 1 from public.rbac_assignments a
      join public.rbac_role_permissions rp on rp.role_id = a.role_id
      join public.rbac_permissions p on p.id = rp.permission_id
      where a.company_id = p_company_id and a.user_id = auth.uid()
        and p.action = p_action and p.resource = p_resource
    )
$$;

create function public.authorization_projection(p_company_id uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select case when public.rbac_renew_authorization(p_company_id) then jsonb_build_object(
    'user_id', auth.uid(), 'company_id', p_company_id,
    'roles', (select coalesce(jsonb_agg(distinct r.name), '[]') from public.rbac_assignments a
      join public.rbac_roles r on r.id = a.role_id
      where a.company_id = p_company_id and a.user_id = auth.uid()),
    'capabilities', (select coalesce(jsonb_agg(distinct jsonb_build_object('action', p.action, 'resource', p.resource)), '[]')
      from public.rbac_assignments a join public.rbac_role_permissions rp on rp.role_id = a.role_id
      join public.rbac_permissions p on p.id = rp.permission_id
      where a.company_id = p_company_id and a.user_id = auth.uid()),
    'enabled_modules', (select coalesce(jsonb_agg(cm.module_key), '[]') from public.rbac_company_modules cm
      where cm.company_id = p_company_id and cm.enabled)
  ) end
$$;

create policy rbac_documents_select on public.rbac_documents for select to authenticated using (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'read', 'documents', 'operations')
);
create policy rbac_documents_update on public.rbac_documents for update to authenticated using (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'update', 'documents', 'operations')
) with check (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'update', 'documents', 'operations')
);
create policy rbac_audit_select on public.rbac_audit_events for select to authenticated using (
  actor_id = auth.uid() and public.rbac_renew_authorization(company_id)
);

-- Administration is capability-gated; tenant mutations still require an active membership.
create policy rbac_companies_admin on public.rbac_companies for all to authenticated using (
  public.rbac_has_capability(public.rbac_request_company_id(), 'manage', 'access-control')
) with check (
  public.rbac_has_capability(public.rbac_request_company_id(), 'manage', 'access-control')
);
create policy rbac_roles_admin on public.rbac_roles for all to authenticated using (
  public.rbac_has_capability(public.rbac_request_company_id(), 'manage', 'access-control')
) with check (
  public.rbac_has_capability(public.rbac_request_company_id(), 'manage', 'access-control')
);
create policy rbac_permissions_admin on public.rbac_permissions for all to authenticated using (
  public.rbac_has_capability(public.rbac_request_company_id(), 'manage', 'access-control')
) with check (
  public.rbac_has_capability(public.rbac_request_company_id(), 'manage', 'access-control')
);
create policy rbac_role_permissions_admin on public.rbac_role_permissions for all to authenticated using (
  public.rbac_has_capability(public.rbac_request_company_id(), 'manage', 'access-control')
) with check (
  public.rbac_has_capability(public.rbac_request_company_id(), 'manage', 'access-control')
);
create policy rbac_memberships_admin on public.rbac_memberships for all to authenticated using (
  public.rbac_has_capability(company_id, 'manage', 'access-control')
) with check (
  public.rbac_has_capability(company_id, 'manage', 'access-control')
);
create policy rbac_assignments_admin on public.rbac_assignments for all to authenticated using (
  public.rbac_has_capability(company_id, 'manage', 'access-control')
) with check (
  public.rbac_has_capability(company_id, 'manage', 'access-control')
);
create policy rbac_modules_admin on public.rbac_company_modules for all to authenticated using (
  public.rbac_has_capability(company_id, 'manage', 'access-control')
) with check (
  public.rbac_has_capability(company_id, 'manage', 'access-control')
);

create function public.rbac_record_audit(
  p_company_id uuid, p_event_type text, p_outcome text, p_target jsonb default '{}'::jsonb
) returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.rbac_audit_events(actor_id, company_id, event_type, outcome, target)
  values (auth.uid(), p_company_id, p_event_type, p_outcome, p_target);
end
$$;

create function public.rbac_reject_audit_mutation() returns trigger
language plpgsql set search_path = '' as $$
begin raise exception 'authorization audit events are immutable' using errcode = '42501'; end
$$;
create trigger rbac_audit_immutable before update or delete on public.rbac_audit_events
for each row execute function public.rbac_reject_audit_mutation();

revoke all on public.rbac_companies, public.rbac_principals, public.rbac_roles,
  public.rbac_permissions, public.rbac_role_permissions, public.rbac_memberships,
  public.rbac_assignments, public.rbac_company_modules, public.rbac_documents,
  public.rbac_audit_events from anon;
revoke all on public.rbac_companies, public.rbac_principals, public.rbac_roles,
  public.rbac_permissions, public.rbac_role_permissions, public.rbac_memberships,
  public.rbac_assignments, public.rbac_company_modules, public.rbac_documents,
  public.rbac_audit_events from authenticated;
grant select, update on public.rbac_documents to authenticated;
grant select on public.rbac_audit_events to authenticated;
revoke all on function public.rbac_request_company_id() from public;
revoke all on function public.rbac_renew_authorization(uuid) from public;
revoke all on function public.rbac_has_capability(uuid, text, text, text) from public;
revoke all on function public.authorization_projection(uuid) from public;
revoke all on function public.rbac_record_audit(uuid, text, text, jsonb) from public;
grant execute on function public.rbac_request_company_id() to authenticated;
grant execute on function public.rbac_renew_authorization(uuid) to authenticated;
grant execute on function public.rbac_has_capability(uuid, text, text, text) to authenticated;
grant execute on function public.authorization_projection(uuid) to authenticated;
grant execute on function public.rbac_record_audit(uuid, text, text, jsonb) to authenticated;
