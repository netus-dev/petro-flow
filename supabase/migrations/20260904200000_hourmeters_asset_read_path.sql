-- Restore the independent Hour Meters asset read path after Traceability CRUD RLS replaced it.
insert into public.hourmeters_settings (company_id)
select id
from public.rbac_companies
where name = 'Perforadora Integral de Oriente Ixachi'
on conflict (company_id) do nothing;

drop policy if exists assets_same_company_read on public.assets;
create policy assets_same_company_read on public.assets
for select to authenticated
using (
  company_id = public.rbac_request_company_id()
  and (
    public.rbac_has_capability(company_id, 'read', 'assets', 'trazabilidad')
    or (
      public.rbac_has_capability(company_id, 'read', 'hour-meters', 'hour-meters')
      and is_active
      and public.rbac_operational_rig_allowed(company_id, current_location_id)
      and exists (
        select 1
        from public.functional_principles fp
        join public.hourmeters_settings s on s.company_id = assets.company_id
        where fp.id = assets.function_principle_id
          and fp.company_id = assets.company_id
          and fp.name = any(s.eligible_functional_principles)
      )
    )
  )
);

comment on policy assets_same_company_read on public.assets is
  'Traceability readers see company assets; Hour Meters readers see only eligible active assets in their authorized Rigs.';
