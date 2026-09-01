-- Hour-meter users need to resolve the position embedded in each asset.
-- Keep the same-company boundary and do not grant general catalog access.
drop policy if exists catalog_ubications_read on public.ubications;

create policy catalog_ubications_read on public.ubications for select to authenticated using (
  company_id = public.rbac_request_company_id()
  and (
    public.rbac_can_read_catalog(company_id)
    or public.rbac_has_capability(company_id, 'read', 'hour-meters', 'hour-meters')
  )
);
