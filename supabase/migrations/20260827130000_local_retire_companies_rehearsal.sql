-- Local-only post-seed rehearsal for retiring the legacy companies table.
-- The seed invokes this after all legacy data and FK cutovers are complete.

create or replace function public.rbac_rehearse_retire_companies()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  companies_table oid;
  dependent_object text;
  source_dependency text;
begin
  companies_table := to_regclass('public.companies');
  if companies_table is null then
    return;
  end if;

  -- These helpers intentionally read the legacy table during the rehearsal;
  -- remove them before proving the post-retirement runtime graph is clean.
  drop function if exists public.rbac_rehearse_remove_users_company_id();
  drop function if exists public.rbac_rehearse_company_fk_repoint();
  drop function if exists public.rbac_rehearse_legacy_consolidation();
  drop function if exists public.rbac_project_legacy();
  drop view if exists rbac_compat.rbac_companies;
  drop view if exists rbac_compat.companies;
  drop view if exists rbac_compat.users;
  drop view if exists rbac_compat.roles;
  drop view if exists rbac_compat.permissions;
  drop view if exists rbac_compat.user_roles;
  drop view if exists rbac_compat.role_permissions;
  drop view if exists public.rbac_compat_reconciliation;

  select format('%I.%I', n.nspname, c.relname)
    into dependent_object
    from pg_catalog.pg_depend d
    join pg_catalog.pg_class c on c.oid = d.classid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
   where d.refobjid = companies_table
     and d.deptype = 'n'
     and d.classid not in (
       'pg_catalog.pg_class'::regclass,
       'pg_catalog.pg_constraint'::regclass,
       'pg_catalog.pg_rewrite'::regclass,
       'pg_catalog.pg_trigger'::regclass,
       'pg_catalog.pg_policy'::regclass
     )
   limit 1;

  if dependent_object is not null then
    raise exception 'companies retirement precondition failed: catalog dependency %', dependent_object;
  end if;

  select format('%I.%I', n.nspname, p.proname)
    into source_dependency
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
   where p.oid <> 'public.rbac_rehearse_retire_companies()'::regprocedure
     and p.prosrc ~* '(^|[^a-z_])((public\.)?companies)([^a-z_]|$)'
   limit 1;

  if source_dependency is not null then
    raise exception 'companies retirement precondition failed: function source dependency %', source_dependency;
  end if;

  execute 'drop table public.companies';
end
$$;

revoke all on function public.rbac_rehearse_retire_companies() from public, anon, authenticated;
