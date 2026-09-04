-- Local-only, reversible legacy-to-explicit RBAC projection.
-- This migration preserves legacy tables and records every skipped candidate.

create table public.rbac_compat_exceptions (
  id bigint generated always as identity primary key,
  source_table text not null,
  source_id text not null,
  reason text not null check (reason in (
    'orphan_user', 'orphan_company', 'orphan_role', 'orphan_permission',
    'invalid_company', 'unscoped_role', 'ambiguous_role', 'missing_membership'
  )),
  details jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (source_table, source_id, reason)
);

comment on table public.rbac_compat_exceptions is
  'Local reconciliation ledger for legacy RBAC projection; no authorization authority.';

-- The pre-existing local role table did not carry tenant scope. Add it before
-- projection so every imported role and assignment has one explicit company.
alter table public.rbac_roles add column company_id uuid;
alter table public.rbac_roles add constraint rbac_roles_company_fk
  foreign key (company_id) references public.rbac_companies(id) on delete cascade;
alter table public.rbac_roles drop constraint if exists rbac_roles_name_key;
alter table public.rbac_roles add constraint rbac_roles_name_company_key unique (name, company_id);
alter table public.rbac_roles add constraint rbac_roles_id_company_key unique (id, company_id);
alter table public.rbac_assignments add constraint rbac_assignments_role_scope_fk
  foreign key (role_id, company_id) references public.rbac_roles(id, company_id) on delete cascade;

create or replace function public.rbac_project_legacy()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_row record;
begin
  -- Principals are linked to existing auth identities; no identity is created.
  insert into public.rbac_principals (user_id, is_active)
  select u.id, coalesce(u.is_active, false)
  from public.users u
  join auth.users au on au.id = u.id
  on conflict (user_id) do update set is_active = excluded.is_active;

  -- Companies, roles, and capabilities retain stable legacy IDs. Permissions are
  -- global capabilities; legacy company_id is deliberately not copied.
  insert into public.rbac_companies (id, name, is_active)
  select c.id, coalesce(c.name, c.id::text), coalesce(c.is_active, false)
  from public.companies c
  on conflict (id) do update set name = excluded.name, is_active = excluded.is_active;

  insert into public.rbac_roles (id, name, company_id)
  select r.id, r.name, r.company_id from public.roles r
  where r.company_id is not null
    and not exists (
      select 1 from public.roles duplicate
      where duplicate.name = r.name and duplicate.id <> r.id
    )
   on conflict (id) do update set name = excluded.name, company_id = excluded.company_id;

  insert into public.rbac_permissions (id, action, resource)
  select distinct on (p.name) p.id, split_part(p.name, '.', 1), split_part(p.name, '.', 2)
  from public.permissions p
  where position('.' in p.name) > 0
  order by p.name, p.id
   on conflict (action, resource) do nothing;

  insert into public.rbac_role_permissions (role_id, permission_id)
  select rp.role_id, rp.permission_id
  from public.role_permissions rp
  join public.rbac_roles r on r.id = rp.role_id
  join public.permissions legacy_permission on legacy_permission.id = rp.permission_id
  join public.rbac_permissions p on p.action = split_part(legacy_permission.name, '.', 1)
    and p.resource = split_part(legacy_permission.name, '.', 2)
  on conflict do nothing;

  -- Memberships come only from valid users.company_id, never from user_roles.
  insert into public.rbac_memberships (company_id, user_id, is_active)
  select u.company_id, u.id, coalesce(u.is_active, false) and coalesce(c.is_active, false)
  from public.users u
  join public.rbac_principals p on p.user_id = u.id
  join public.companies c on c.id = u.company_id
  join public.rbac_companies rc on rc.id = c.id
  on conflict (company_id, user_id) do update set is_active = excluded.is_active;

  insert into public.rbac_assignments (company_id, user_id, role_id)
  select r.company_id, ur.user_id, ur.role_id
  from public.user_roles ur
  join public.users u on u.id = ur.user_id
  join public.roles r on r.id = ur.role_id
  join public.rbac_memberships m on m.company_id = r.company_id and m.user_id = ur.user_id
  where r.company_id is not null
  on conflict do nothing;

  -- Reconciliation is convergent: resolved rows remain evidence, unresolved rows
  -- are upserted with the latest observation and never silently promoted.
  for source_row in
    select ur.id::text source_id, 'user_roles' source_table, 'orphan_user' reason
    from public.user_roles ur left join public.users u on u.id = ur.user_id
    where u.id is null
    union all
    select ur.id::text, 'user_roles', 'orphan_role'
    from public.user_roles ur left join public.roles r on r.id = ur.role_id
    where r.id is null
    union all
    select r.id::text, 'roles', 'ambiguous_role'
    from public.roles r
    where exists (
      select 1 from public.roles duplicate
      where duplicate.name = r.name and duplicate.id <> r.id
    )
    union all
    select ur.id::text, 'user_roles', 'missing_membership'
    from public.user_roles ur
    join public.users u on u.id = ur.user_id
    join public.roles r on r.id = ur.role_id
    left join public.rbac_memberships m on m.user_id = ur.user_id and m.company_id = r.company_id
    where m.user_id is null
  loop
    insert into public.rbac_compat_exceptions (source_table, source_id, reason)
    values (source_row.source_table, source_row.source_id, source_row.reason)
    on conflict (source_table, source_id, reason) do update set last_seen_at = now();
  end loop;
end
$$;

revoke all on table public.rbac_compat_exceptions from anon, authenticated;
revoke all on function public.rbac_project_legacy() from public, anon, authenticated;

create or replace view public.rbac_compat_reconciliation as
select source_table, reason, count(*)::bigint as exception_count,
       min(first_seen_at) as first_seen_at, max(last_seen_at) as last_seen_at
from public.rbac_compat_exceptions
group by source_table, reason;

select public.rbac_project_legacy();
