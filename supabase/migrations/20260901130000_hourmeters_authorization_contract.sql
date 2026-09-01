-- Align Hourmeters RLS with the canonical permission and module identifiers.
insert into public.rbac_permissions (id, action, resource) values
  ('9a000000-0000-0000-0000-000000000001', 'read', 'hour-meters'),
  ('9a000000-0000-0000-0000-000000000002', 'register', 'hour-meters'),
  ('9a000000-0000-0000-0000-000000000003', 'update', 'hour-meters')
on conflict (action, resource) do nothing;

drop policy if exists hourmeters_settings_read on public.hourmeters_settings;
create policy hourmeters_settings_read on public.hourmeters_settings for select to authenticated
using (company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'read', 'hour-meters', 'hour-meters'));

drop policy if exists hourmeters_settings_manage on public.hourmeters_settings;
create policy hourmeters_settings_manage on public.hourmeters_settings for update to authenticated
using (company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'update', 'hour-meters', 'hour-meters'))
with check (company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'update', 'hour-meters', 'hour-meters'));

drop policy if exists hourmeters_settings_insert on public.hourmeters_settings;
create policy hourmeters_settings_insert on public.hourmeters_settings for insert to authenticated
with check (company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'update', 'hour-meters', 'hour-meters'));

drop policy if exists hourmeters_history_select on public.asset_operational_parameters_history;
create policy hourmeters_history_select on public.asset_operational_parameters_history for select to authenticated
using (company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'read', 'hour-meters', 'hour-meters'));

drop policy if exists hourmeters_history_insert on public.asset_operational_parameters_history;
create policy hourmeters_history_insert on public.asset_operational_parameters_history for insert to authenticated
with check (company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'register', 'hour-meters', 'hour-meters')
  and created_by = auth.uid()
  and exists (select 1 from public.assets a
    join public.functional_principles fp on fp.id = a.function_principle_id
    join public.hourmeters_settings s on s.company_id = a.company_id
    where a.id = asset_operational_parameters_history.asset_id
      and a.company_id = asset_operational_parameters_history.company_id and a.is_active
      and fp.company_id = a.company_id and fp.name = any(s.eligible_functional_principles)));

drop policy if exists assets_same_company_read on public.assets;
create policy assets_same_company_read on public.assets for select to authenticated
using (company_id = public.rbac_request_company_id() and (
  public.rbac_has_capability(company_id, 'read', 'assets', 'operations')
  or (public.rbac_has_capability(company_id, 'read', 'hour-meters', 'hour-meters')
    and exists (select 1 from public.functional_principles fp
      join public.hourmeters_settings s on s.company_id = assets.company_id
      where fp.id = assets.function_principle_id and fp.company_id = assets.company_id
        and fp.name = any(s.eligible_functional_principles)))
));

drop policy if exists catalog_functional_principles_read on public.functional_principles;
create policy catalog_functional_principles_read on public.functional_principles for select to authenticated
using (company_id = public.rbac_request_company_id() and (
  public.rbac_can_read_catalog(company_id)
  or (public.rbac_has_capability(company_id, 'read', 'hour-meters', 'hour-meters')
    and exists (select 1 from public.hourmeters_settings s
      where s.company_id = functional_principles.company_id
        and functional_principles.name = any(s.eligible_functional_principles)))
));

drop policy if exists catalog_locations_read on public.locations;
create policy catalog_locations_read on public.locations for select to authenticated
using (company_id = public.rbac_request_company_id() and (
  public.rbac_can_read_catalog(company_id)
  or (public.rbac_has_capability(company_id, 'read', 'hour-meters', 'hour-meters')
    and exists (select 1 from public.assets a
      join public.functional_principles fp on fp.id = a.function_principle_id and fp.company_id = a.company_id
      join public.hourmeters_settings s on s.company_id = a.company_id
      where a.current_location_id = locations.id and a.company_id = locations.company_id
        and a.is_active and fp.name = any(s.eligible_functional_principles)))
));
