-- Restore the traceability and hourmeter security contract.
-- Ownership is always resolved through the request company and canonical
-- company_id relationships; unowned rows remain invisible.

insert into storage.buckets (id, name, public, allowed_mime_types)
values ('certificates', 'certificates', false, array['application/pdf', 'image/*']::text[])
on conflict (id) do update
set name = excluded.name,
    public = false,
    allowed_mime_types = excluded.allowed_mime_types;

grant select, insert, update, delete on public.certificates to authenticated;
grant select, insert, update, delete on public.assets_certificates to authenticated;
grant select on public.transactions, public.transaction_details to authenticated;

drop policy if exists certificates_traceability_read on public.certificates;
create policy certificates_traceability_read on public.certificates
for select to authenticated
using (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'read', 'certificates', 'operations')
);

drop policy if exists certificates_traceability_write on public.certificates;
create policy certificates_traceability_write on public.certificates
for insert to authenticated
with check (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'create', 'certificates', 'operations')
  and uploaded_by = auth.uid()
);

drop policy if exists certificates_traceability_update on public.certificates;
create policy certificates_traceability_update on public.certificates
for update to authenticated
using (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'update', 'certificates', 'operations')
)
with check (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'update', 'certificates', 'operations')
);

drop policy if exists certificates_traceability_delete on public.certificates;
create policy certificates_traceability_delete on public.certificates
for delete to authenticated
using (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'delete', 'certificates', 'operations')
);

drop policy if exists assets_certificates_traceability_read on public.assets_certificates;
create policy assets_certificates_traceability_read on public.assets_certificates
for select to authenticated
using (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'read', 'certificates', 'operations')
);

drop policy if exists assets_certificates_traceability_write on public.assets_certificates;
create policy assets_certificates_traceability_write on public.assets_certificates
for all to authenticated
using (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'update', 'certificates', 'operations')
)
with check (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'update', 'certificates', 'operations')
);

drop policy if exists transactions_traceability_read on public.transactions;
create policy transactions_traceability_read on public.transactions
for select to authenticated
using (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'read', 'movements', 'operations')
);

drop policy if exists transaction_details_traceability_read on public.transaction_details;
create policy transaction_details_traceability_read on public.transaction_details
for select to authenticated
using (
  company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'read', 'movements', 'operations')
);

drop policy if exists certificates_storage_traceability_read on storage.objects;
create policy certificates_storage_traceability_read on storage.objects
for select to authenticated
using (
  bucket_id = 'certificates'
  and owner = auth.uid()
  and exists (
    select 1 from public.certificates c
    where c.storage_path = name
      and c.company_id = public.rbac_request_company_id()
      and c.uploaded_by = auth.uid()
      and public.rbac_has_capability(c.company_id, 'read', 'certificates', 'operations')
  )
);

drop policy if exists certificates_storage_traceability_insert on storage.objects;
create policy certificates_storage_traceability_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'certificates'
  and owner = auth.uid()
);

drop policy if exists certificates_storage_traceability_update on storage.objects;
create policy certificates_storage_traceability_update on storage.objects
for update to authenticated
using (
  bucket_id = 'certificates'
  and owner = auth.uid()
  and exists (select 1 from public.certificates c where c.storage_path = name and c.company_id = public.rbac_request_company_id() and c.uploaded_by = auth.uid())
)
with check (bucket_id = 'certificates' and owner = auth.uid());

comment on table public.assets_certificates is 'Tenant-scoped certificate-to-asset relationship used by traceability.';
comment on table public.transactions is 'Tenant-scoped movement header used by traceability.';
comment on table public.transaction_details is 'Tenant-scoped movement asset detail used by traceability.';
