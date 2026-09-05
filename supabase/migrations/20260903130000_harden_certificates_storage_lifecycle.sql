-- Keep certificate Storage private while supporting upload-before-metadata.
drop policy if exists certificates_storage_traceability_read on storage.objects;
create policy certificates_storage_traceability_read on storage.objects
for select to authenticated using (
  bucket_id = 'certificates'
  and owner = auth.uid()
  and exists (
    select 1 from public.certificates c
    where c.storage_path = storage.objects.name
      and c.company_id = public.rbac_request_company_id()
      and c.uploaded_by = auth.uid()
      and public.rbac_has_capability(c.company_id, 'read', 'certificates', 'operations')
  )
);

drop policy if exists certificates_storage_traceability_insert on storage.objects;
create policy certificates_storage_traceability_insert on storage.objects
for insert to authenticated with check (
  bucket_id = 'certificates'
  and owner = auth.uid()
  and name ~ '^[0-9a-fA-F-]{36}\.[^/]+$'
);

drop policy if exists certificates_storage_traceability_update on storage.objects;
create policy certificates_storage_traceability_update on storage.objects
for update to authenticated using (
  bucket_id = 'certificates'
  and owner = auth.uid()
  and exists (select 1 from public.certificates c where c.storage_path = storage.objects.name and c.company_id = public.rbac_request_company_id() and c.uploaded_by = auth.uid())
) with check (bucket_id = 'certificates' and owner = auth.uid());

drop policy if exists certificates_storage_traceability_delete on storage.objects;
create policy certificates_storage_traceability_delete on storage.objects
for delete to authenticated using (
  bucket_id = 'certificates'
  and owner = auth.uid()
  and exists (select 1 from public.certificates c where c.storage_path = storage.objects.name and c.company_id = public.rbac_request_company_id() and c.uploaded_by = auth.uid())
);
