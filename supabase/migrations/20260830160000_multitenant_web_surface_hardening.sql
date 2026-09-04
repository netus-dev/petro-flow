-- Close web-role exposure. Tenant ownership is explicit on canonical
-- operational rows and is never inferred from profile data.
do $$
declare
  business_table regclass;
begin
  for business_table in
    select c.oid::regclass
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
  loop
    execute format('revoke all on table %s from anon', business_table);
  end loop;
end
$$;

alter table public.locations enable row level security;
alter table public.functional_principles enable row level security;
alter table public.ubications enable row level security;
alter table public.assets enable row level security;
alter table public.certificates enable row level security;

revoke all on table public.assets, public.certificates from authenticated;
revoke all on sequence public.rbac_audit_events_id_seq from public, anon, authenticated;
grant all on sequence public.rbac_audit_events_id_seq to service_role;

-- Tenant catalog policies are read-only, so their grants must be read-only too.
-- Rows without company ownership and requests without x-company-id remain
-- invisible by design.
revoke all on table
  public.locations,
  public.functional_principles,
  public.ubications,
  public.brands,
  public.models,
  public.suppliers,
  public.wells,
  public.operating_bases,
  public.rigs
from authenticated;
grant select on table
  public.locations,
  public.functional_principles,
  public.ubications,
  public.brands,
  public.models,
  public.suppliers,
  public.wells,
  public.operating_bases,
  public.rigs
to authenticated;

-- Certificate storage is fail-closed until canonical company ownership exists.
drop policy if exists certificates_select_owned on storage.objects;
drop policy if exists certificates_insert_owned on storage.objects;
drop policy if exists certificates_update_owned on storage.objects;
drop function if exists rbac_private.certificate_storage_path_uploaded_by_owned(text, uuid);
drop schema if exists rbac_private;

create or replace function public.rbac_record_audit(
  p_company_id uuid,
  p_event_type text,
  p_outcome text,
  p_target jsonb default '{}'::jsonb
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(current_setting('role', true), '') <> 'service_role'
    and (
      p_company_id is distinct from public.rbac_request_company_id()
      or not public.rbac_renew_authorization(p_company_id)
    )
  then
    raise exception 'audit company must match an active request company'
      using errcode = '42501';
  end if;

  insert into public.rbac_audit_events(actor_id, company_id, event_type, outcome, target)
  values (auth.uid(), p_company_id, p_event_type, p_outcome, p_target);
end
$$;

-- PostgreSQL grants EXECUTE to PUBLIC by default. Revoke every current public
-- function explicitly before restoring only the reviewed role contracts.
revoke all on function public.authorization_projection(uuid) from public, anon, authenticated;
revoke all on function public.get_asset_stats_by_functional_principle(uuid) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.rbac_active_company_memberships() from public, anon, authenticated;
revoke all on function public.rbac_can_read_catalog(uuid) from public, anon, authenticated;
revoke all on function public.rbac_has_capability(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.rbac_record_audit(uuid, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.rbac_reject_audit_mutation() from public, anon, authenticated;
revoke all on function public.rbac_renew_authorization(uuid) from public, anon, authenticated;
revoke all on function public.rbac_request_company_id() from public, anon, authenticated;

grant execute on function public.authorization_projection(uuid) to authenticated;
grant execute on function public.rbac_active_company_memberships() to authenticated;
grant execute on function public.rbac_can_read_catalog(uuid) to authenticated;
grant execute on function public.rbac_has_capability(uuid, text, text, text) to authenticated;
grant execute on function public.rbac_record_audit(uuid, text, text, jsonb) to authenticated;
grant execute on function public.rbac_renew_authorization(uuid) to authenticated;
grant execute on function public.rbac_request_company_id() to authenticated;

grant execute on function public.authorization_projection(uuid) to service_role;
grant execute on function public.get_asset_stats_by_functional_principle(uuid) to service_role;
grant execute on function public.handle_new_user() to service_role;
grant execute on function public.rbac_active_company_memberships() to service_role;
grant execute on function public.rbac_can_read_catalog(uuid) to service_role;
grant execute on function public.rbac_has_capability(uuid, text, text, text) to service_role;
grant execute on function public.rbac_record_audit(uuid, text, text, jsonb) to service_role;
grant execute on function public.rbac_reject_audit_mutation() to service_role;
grant execute on function public.rbac_renew_authorization(uuid) to service_role;
grant execute on function public.rbac_request_company_id() to service_role;
