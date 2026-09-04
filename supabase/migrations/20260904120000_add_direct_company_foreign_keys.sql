-- Enforce direct ownership relationships against the canonical company table.
-- These two rows are legacy fixtures with no tenant ownership. Remove only their
-- orphaned dependants before the RESTRICT location FK is installed.
delete from public.assets_certificates ac
using public.assets a, public.locations l
where ac.asset_id = a.id
  and a.current_location_id = l.id
  and l.name in ('Base Norte', 'Pozo Alfa')
  and l.company_id is null;

delete from public.transaction_details td
using public.assets a, public.locations l
where td.asset_id = a.id
  and a.current_location_id = l.id
  and l.name in ('Base Norte', 'Pozo Alfa')
  and l.company_id is null;

delete from public.assets a
using public.locations l
where a.current_location_id = l.id
  and l.name in ('Base Norte', 'Pozo Alfa')
  and l.company_id is null;

delete from public.locations
where name in ('Base Norte', 'Pozo Alfa')
  and company_id is null;

-- Allow the FK's internal SET NULL action while keeping audit rows immutable to callers.
create or replace function public.rbac_reject_audit_mutation() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and pg_trigger_depth() > 0 and old.company_id is not null and new.company_id is null then
    return new;
  end if;
  raise exception 'authorization audit events are immutable' using errcode = '42501';
end
$$;

do $$
declare
  invalid_count bigint;
begin
  select count(*) into invalid_count
  from public.locations l
  where l.company_id is null
     or not exists (select 1 from public.rbac_companies c where c.id = l.company_id);
  if invalid_count > 0 then
    raise exception 'Cannot add locations.company_id foreign key: % NULL or orphan company IDs found', invalid_count
      using errcode = '23514';
  end if;

  select count(*) into invalid_count
  from public.rbac_roles r
  where r.company_id is null
     or not exists (select 1 from public.rbac_companies c where c.id = r.company_id);
  if invalid_count > 0 then
    raise exception 'Cannot add rbac_roles.company_id foreign key: % NULL or orphan company IDs found', invalid_count
      using errcode = '23514';
  end if;
end
$$;

alter table public.locations
  drop constraint if exists locations_company_id_fkey;
alter table public.locations
  add constraint locations_company_id_fkey
  foreign key (company_id)
  references public.rbac_companies(id)
  on delete restrict;

alter table public.rbac_roles
  drop constraint if exists rbac_roles_company_id_fkey;
alter table public.rbac_roles
  add constraint rbac_roles_company_id_fkey
  foreign key (company_id)
  references public.rbac_companies(id)
  on delete cascade;

alter table public.rbac_audit_events
  drop constraint if exists rbac_audit_events_company_id_fkey;
alter table public.rbac_audit_events
  add constraint rbac_audit_events_company_id_fkey
  foreign key (company_id)
  references public.rbac_companies(id)
  on delete set null;
