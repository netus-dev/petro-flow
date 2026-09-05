-- Deployed baseline: CRUD permissions and traceability RLS for assets/certificates.

insert into public.rbac_permissions (id, action, resource) values
  (gen_random_uuid(), 'read', 'assets'),
  (gen_random_uuid(), 'create', 'assets'),
  (gen_random_uuid(), 'update', 'assets'),
  (gen_random_uuid(), 'delete', 'assets'),
  (gen_random_uuid(), 'read', 'certificates'),
  (gen_random_uuid(), 'create', 'certificates'),
  (gen_random_uuid(), 'update', 'certificates'),
  (gen_random_uuid(), 'delete', 'certificates')
on conflict (action, resource) do nothing;

drop policy if exists assets_same_company_read on public.assets;
create policy assets_same_company_read on public.assets for select to authenticated using (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'read', 'assets', 'trazabilidad')
);
drop policy if exists assets_same_company_write on public.assets;
create policy assets_same_company_write on public.assets for insert to authenticated with check (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'create', 'assets', 'trazabilidad')
);
drop policy if exists assets_same_company_update on public.assets;
create policy assets_same_company_update on public.assets for update to authenticated
using (company_id = public.rbac_request_company_id() and public.rbac_has_capability(company_id, 'update', 'assets', 'trazabilidad'))
with check (company_id = public.rbac_request_company_id() and public.rbac_has_capability(company_id, 'update', 'assets', 'trazabilidad'));
drop policy if exists assets_same_company_delete on public.assets;
create policy assets_same_company_delete on public.assets for delete to authenticated using (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'delete', 'assets', 'trazabilidad')
);

drop policy if exists certificates_traceability_read on public.certificates;
create policy certificates_traceability_read on public.certificates for select to authenticated using (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'read', 'certificates', 'trazabilidad')
);
drop policy if exists certificates_traceability_write on public.certificates;
create policy certificates_traceability_write on public.certificates for insert to authenticated with check (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'create', 'certificates', 'trazabilidad')
  and uploaded_by = auth.uid()
);
drop policy if exists certificates_traceability_update on public.certificates;
create policy certificates_traceability_update on public.certificates for update to authenticated
using (company_id = public.rbac_request_company_id() and public.rbac_has_capability(company_id, 'update', 'certificates', 'trazabilidad'))
with check (company_id = public.rbac_request_company_id() and public.rbac_has_capability(company_id, 'update', 'certificates', 'trazabilidad'));
drop policy if exists certificates_traceability_delete on public.certificates;
create policy certificates_traceability_delete on public.certificates for delete to authenticated using (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'delete', 'certificates', 'trazabilidad')
);

comment on policy assets_same_company_read on public.assets is 'Traceability read access is restricted to the request company.';
comment on policy certificates_traceability_read on public.certificates is 'Traceability read access is restricted to the request company.';
