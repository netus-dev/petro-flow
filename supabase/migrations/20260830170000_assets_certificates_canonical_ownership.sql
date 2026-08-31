-- Slice 2: establish canonical ownership without guessing legacy tenants.
-- Existing legacy rows remain NULL-owned and therefore fail closed in RLS.

alter table public.assets add column if not exists company_id uuid;

alter table public.assets
  drop constraint if exists assets_company_id_fkey;
alter table public.assets
  add constraint assets_company_id_fkey
  foreign key (company_id) references public.rbac_companies(id);

-- These composite keys prevent an owned asset from pointing at another
-- company's location or functional-principle row.
alter table public.locations
  drop constraint if exists locations_company_id_id_key;
alter table public.locations
  add constraint locations_company_id_id_key unique (company_id, id);
alter table public.functional_principles
  drop constraint if exists functional_principles_company_id_id_key;
alter table public.functional_principles
  add constraint functional_principles_company_id_id_key unique (company_id, id);

alter table public.assets
  drop constraint if exists assets_location_same_company_fkey;
alter table public.assets
  add constraint assets_location_same_company_fkey
  foreign key (company_id, current_location_id)
  references public.locations(company_id, id);
alter table public.assets
  drop constraint if exists assets_function_principle_same_company_fkey;
alter table public.assets
  add constraint assets_function_principle_same_company_fkey
  foreign key (company_id, function_principle_id)
  references public.functional_principles(company_id, id);

alter table public.assets enable row level security;
alter table public.certificates enable row level security;

revoke all on table public.assets, public.certificates from authenticated;
grant select, insert, update, delete on table public.assets, public.certificates to authenticated;

drop policy if exists assets_same_company_read on public.assets;
create policy assets_same_company_read on public.assets
  for select to authenticated
  using (
    company_id = public.rbac_request_company_id()
    and public.rbac_has_capability(company_id, 'read', 'assets', 'operations')
  );

drop policy if exists assets_same_company_write on public.assets;
create policy assets_same_company_write on public.assets
  for insert to authenticated
  with check (
    company_id = public.rbac_request_company_id()
    and public.rbac_has_capability(company_id, 'create', 'assets', 'operations')
  );

drop policy if exists assets_same_company_update on public.assets;
create policy assets_same_company_update on public.assets
  for update to authenticated
  using (
    company_id = public.rbac_request_company_id()
    and public.rbac_has_capability(company_id, 'update', 'assets', 'operations')
  )
  with check (
    company_id = public.rbac_request_company_id()
    and public.rbac_has_capability(company_id, 'update', 'assets', 'operations')
  );

drop policy if exists assets_same_company_delete on public.assets;
create policy assets_same_company_delete on public.assets
  for delete to authenticated
  using (
    company_id = public.rbac_request_company_id()
    and public.rbac_has_capability(company_id, 'delete', 'assets', 'operations')
  );

drop policy if exists certificates_same_company_read on public.certificates;
create policy certificates_same_company_read on public.certificates
  for select to authenticated
  using (
    exists (
      select 1 from public.assets a
      where a.id = certificates.asset_id
        and a.company_id = public.rbac_request_company_id()
        and public.rbac_has_capability(a.company_id, 'read', 'certificates', 'operations')
    )
  );

drop policy if exists certificates_same_company_write on public.certificates;
create policy certificates_same_company_write on public.certificates
  for insert to authenticated
  with check (
    exists (
      select 1 from public.assets a
      where a.id = certificates.asset_id
        and a.company_id = public.rbac_request_company_id()
        and public.rbac_has_capability(a.company_id, 'create', 'certificates', 'operations')
    )
  );

drop policy if exists certificates_same_company_update on public.certificates;
create policy certificates_same_company_update on public.certificates
  for update to authenticated
  using (
    exists (
      select 1 from public.assets a
      where a.id = certificates.asset_id
        and a.company_id = public.rbac_request_company_id()
        and public.rbac_has_capability(a.company_id, 'update', 'certificates', 'operations')
    )
  )
  with check (
    exists (
      select 1 from public.assets a
      where a.id = certificates.asset_id
        and a.company_id = public.rbac_request_company_id()
        and public.rbac_has_capability(a.company_id, 'update', 'certificates', 'operations')
    )
  );

drop policy if exists certificates_same_company_delete on public.certificates;
create policy certificates_same_company_delete on public.certificates
  for delete to authenticated
  using (
    exists (
      select 1 from public.assets a
      where a.id = certificates.asset_id
        and a.company_id = public.rbac_request_company_id()
        and public.rbac_has_capability(a.company_id, 'delete', 'certificates', 'operations')
    )
  );

-- Do not make company_id NOT NULL until every legacy asset has an evidenced owner.
-- Do not restore certificate Storage policies or the statistics RPC in this slice.
