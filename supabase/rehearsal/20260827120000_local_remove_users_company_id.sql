-- Local-only final rehearsal for removing the legacy profile membership field.
-- The seed invokes this after loading the disposable legacy fixture.

create or replace function public.rbac_rehearse_remove_users_company_id()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  users_table oid;
  company_column smallint;
  missing_membership boolean;
  dependent_object text;
begin
  drop view if exists rbac_compat.users;
  perform public.rbac_rehearse_company_fk_repoint();

  select c.oid, a.attnum
    into users_table, company_column
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    join pg_catalog.pg_attribute a on a.attrelid = c.oid
   where n.nspname = 'public'
     and c.relname = 'users'
     and a.attname = 'company_id'
     and not a.attisdropped;

  if users_table is null then
    return;
  end if;

  select exists (
    select 1
      from public.users u
      left join public.rbac_memberships m
        on m.user_id = u.id and m.company_id = u.company_id
     where u.company_id is not null and m.user_id is null
  ) into missing_membership;

  if missing_membership then
    raise exception 'users.company_id removal precondition failed: replacement membership is missing';
  end if;

  alter table public.users drop constraint if exists users_company_id_fkey;

  select format('%I.%I (%s)', n.nspname, c.relname, coalesce(nullif(obj_description(c.oid, 'pg_class'), ''), 'unnamed'))
    into dependent_object
    from pg_catalog.pg_depend d
    join pg_catalog.pg_class c on c.oid = d.classid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
   where d.refobjid = users_table and d.refobjsubid = company_column
     and d.classid not in ('pg_catalog.pg_constraint'::regclass, 'pg_catalog.pg_rewrite'::regclass)
   limit 1;

  if dependent_object is not null then
    raise exception 'users.company_id removal precondition failed: dependent object %', dependent_object;
  end if;

  execute 'alter table public.users drop column company_id';

  if exists (
    select 1
      from pg_catalog.pg_attribute
     where attrelid = users_table and attname = 'company_id' and not attisdropped
  ) then
    raise exception 'users.company_id removal failed: column remains';
  end if;

  if exists (
    select 1
      from pg_catalog.pg_depend
     where refobjid = users_table and refobjsubid = company_column
  ) then
    raise exception 'users.company_id removal failed: catalog dependency remains';
  end if;
end
$$;

revoke all on function public.rbac_rehearse_remove_users_company_id() from public, anon, authenticated;
