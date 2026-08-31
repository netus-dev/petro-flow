-- Local-only first consolidation rehearsal. The preflight report is transaction
-- scoped; no compatibility exception ledger is retained in the schema.

drop view if exists public.rbac_compat_reconciliation;
drop function if exists public.rbac_project_legacy();
drop table if exists public.rbac_compat_exceptions;

create or replace function public.rbac_rehearse_legacy_consolidation()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  drop table if exists pg_temp.rbac_rehearsal_preflight;
  create temporary table rbac_rehearsal_preflight (
    source_table text not null,
    source_id text not null,
    reason text not null,
    details jsonb not null default '{}'::jsonb
  ) on commit drop;

  insert into pg_temp.rbac_rehearsal_preflight
  select 'companies', c.id::text, 'duplicate_identity', jsonb_build_object('id', c.id)
  from public.companies c
  group by c.id having count(*) > 1;

  insert into pg_temp.rbac_rehearsal_preflight
  select 'users', u.id::text, 'unlinked_auth', '{}'::jsonb
  from public.users u left join auth.users au on au.id = u.id
  where au.id is null;

  insert into pg_temp.rbac_rehearsal_preflight
  select 'users', u.id::text, 'invalid_company', jsonb_build_object('company_id', u.company_id)
  from public.users u left join public.companies c on c.id = u.company_id
  where u.company_id is not null and c.id is null;

  insert into pg_temp.rbac_rehearsal_preflight
  select 'certificates', c.id::text, 'storage_ownership_mismatch',
         jsonb_build_object('storage_path', c.storage_path)
  from public.certificates c
  left join storage.objects o on o.bucket_id = 'certificates' and o.name = c.storage_path
  where o.id is null or o.owner is distinct from c.uploaded_by;

  if exists (select 1 from pg_temp.rbac_rehearsal_preflight where reason = 'invalid_company') then
    raise exception 'legacy consolidation preflight failed: invalid company reference';
  end if;

  insert into public.rbac_companies (id, name, is_active)
  select c.id, coalesce(c.name, c.id::text), coalesce(c.is_active, false)
  from public.companies c
  on conflict (id) do update set name = excluded.name, is_active = excluded.is_active;

  insert into public.rbac_principals (user_id, is_active)
  select u.id, coalesce(u.is_active, false)
  from public.users u join auth.users au on au.id = u.id
  on conflict (user_id) do update set is_active = excluded.is_active;

  -- Membership is independent evidence from users.company_id, not user_roles.
  insert into public.rbac_memberships (company_id, user_id, is_active)
  select u.company_id, u.id, coalesce(u.is_active, false) and c.is_active
  from public.users u join public.companies c on c.id = u.company_id
  join public.rbac_principals p on p.user_id = u.id
  on conflict (company_id, user_id) do update set is_active = excluded.is_active;

  insert into public.rbac_roles (id, name, company_id)
  select r.id, r.name, r.company_id
  from public.roles r join public.rbac_companies c on c.id = r.company_id
  on conflict (id) do update set name = excluded.name, company_id = excluded.company_id;

  insert into public.rbac_permissions (id, action, resource)
  select distinct on (split_part(p.name, '.', 1), split_part(p.name, '.', 2))
    p.id, split_part(p.name, '.', 1), split_part(p.name, '.', 2)
  from public.permissions p
  where p.name ~ '^[^.]+\.[^.]+$'
  order by split_part(p.name, '.', 1), split_part(p.name, '.', 2), p.id
  on conflict (action, resource) do nothing;

  insert into public.rbac_role_permissions (role_id, permission_id)
  select rp.role_id, cp.id
  from public.role_permissions rp
  join public.roles r on r.id = rp.role_id
  join public.permissions p on p.id = rp.permission_id
  join public.rbac_permissions cp on cp.action = split_part(p.name, '.', 1)
    and cp.resource = split_part(p.name, '.', 2)
  where p.name ~ '^[^.]+\.[^.]+$'
  on conflict do nothing;

  insert into public.rbac_assignments (company_id, user_id, role_id)
  select r.company_id, ur.user_id, ur.role_id
  from public.user_roles ur join public.users u on u.id = ur.user_id
  join public.roles r on r.id = ur.role_id
  join public.rbac_memberships m on m.company_id = r.company_id and m.user_id = ur.user_id
  where r.company_id is not null
  on conflict do nothing;
end
$$;

revoke all on function public.rbac_rehearse_legacy_consolidation() from public, anon, authenticated;
select public.rbac_rehearse_legacy_consolidation();
