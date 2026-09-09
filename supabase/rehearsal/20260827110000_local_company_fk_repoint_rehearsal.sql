-- Local-only rehearsal for repointing legacy business company FKs.
-- This defines, but does not execute, the rehearsal because local seed data is
-- loaded after migrations. Do not deploy to a remote environment.

create or replace function public.rbac_rehearse_company_fk_repoint()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target record;
  constraint_row record;
  delete_action text;
  update_action text;
  constraint_name text;
  invalid_reference boolean;
begin
  if to_regclass('public.rbac_companies') is null then
    raise exception 'company FK rehearsal precondition failed: public.rbac_companies is missing';
  end if;

  insert into public.rbac_companies (id, name, is_active)
  select c.id, coalesce(c.name, c.id::text), coalesce(c.is_active, false)
  from public.companies c
  on conflict (id) do update set name = excluded.name, is_active = excluded.is_active;

  drop table if exists pg_temp.rbac_rehearsal_company_fk_catalog;
  create temporary table rbac_rehearsal_company_fk_catalog (
    table_name text not null,
    constraint_name text not null,
    delete_action "char" not null,
    update_action "char" not null
  ) on commit drop;

  for target in
    select unnest(array[
      'users', 'assets', 'brands', 'functional_principle_scopes', 'functional_principles',
      'locations', 'models', 'permissions', 'roles', 'suppliers', 'ubications', 'wells'
    ]) as table_name
  loop
    if to_regclass(format('public.%I', target.table_name)) is null
       or not exists (select 1 from information_schema.columns cols where cols.table_schema = 'public' and cols.table_name = target.table_name and cols.column_name = 'company_id') then
      continue;
    end if;

    select con.conname, con.confdeltype, con.confupdtype
    into constraint_row
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace ns on ns.oid = rel.relnamespace
    join pg_class parent on parent.oid = con.confrelid
    join pg_namespace pns on pns.oid = parent.relnamespace
    where con.contype = 'f' and ns.nspname = 'public' and rel.relname = target.table_name
      and pns.nspname = 'public' and parent.relname = 'companies'
      and con.conkey = array[(select attnum from pg_attribute where attrelid = rel.oid and attname = 'company_id')::smallint];

    if not found then
      continue;
    end if;

    if exists (select 1 from public.companies c left join public.rbac_companies rc on rc.id = c.id where rc.id is null) then
      raise exception 'company FK rehearsal precondition failed: legacy company coverage is incomplete';
    end if;
    execute format('select exists (select 1 from public.%I t left join public.rbac_companies c on c.id = t.company_id where t.company_id is not null and c.id is null)', target.table_name) into invalid_reference;
    if invalid_reference then
      raise exception 'company FK rehearsal precondition failed: invalid company reference in %', target.table_name;
    end if;

    insert into pg_temp.rbac_rehearsal_company_fk_catalog values (target.table_name, constraint_row.conname, constraint_row.confdeltype, constraint_row.confupdtype);
    delete_action := case constraint_row.confdeltype when 'a' then 'NO ACTION' when 'r' then 'RESTRICT' when 'c' then 'CASCADE' when 'n' then 'SET NULL' when 'd' then 'SET DEFAULT' end;
    update_action := case constraint_row.confupdtype when 'a' then 'NO ACTION' when 'r' then 'RESTRICT' when 'c' then 'CASCADE' when 'n' then 'SET NULL' when 'd' then 'SET DEFAULT' end;
    constraint_name := format('fk_%s_company_id_rbac_companies', target.table_name);
    execute format('alter table public.%I drop constraint %I', target.table_name, constraint_row.conname);
    execute format('alter table public.%I add constraint %I foreign key (company_id) references public.rbac_companies(id) on delete %s on update %s', target.table_name, constraint_name, delete_action, update_action);
  end loop;
end
$$;

revoke all on function public.rbac_rehearse_company_fk_repoint() from public, anon, authenticated;
