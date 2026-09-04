-- Local-only hardening of the legacy fixture. This is deliberately narrow:
-- replacement tenant policies require verified authorization semantics.

do $$
declare
  table_name text;
begin
  foreach table_name in array array['companies', 'users', 'roles', 'permissions', 'user_roles', 'role_permissions'] loop
    execute format('drop policy if exists legacy_%I_authenticated_crud on public.%I', table_name, table_name);
    execute format('revoke all on public.%I from authenticated', table_name);
  end loop;
end
$$;

drop policy if exists legacy_certificates_insert on storage.objects;
drop policy if exists legacy_certificates_select on storage.objects;
drop policy if exists legacy_certificates_update on storage.objects;

create policy certificates_select_owned on storage.objects for select to authenticated
  using (
    bucket_id = 'certificates'
    and owner = auth.uid()
    and exists (select 1 from public.certificates c where c.storage_path = name and c.uploaded_by = owner)
  );
create policy certificates_insert_owned on storage.objects for insert to authenticated
  with check (
    bucket_id = 'certificates'
    and owner = auth.uid()
    and exists (select 1 from public.certificates c where c.storage_path = name and c.uploaded_by = owner)
  );
create policy certificates_update_owned on storage.objects for update to authenticated
  using (
    bucket_id = 'certificates'
    and owner = auth.uid()
    and exists (select 1 from public.certificates c where c.storage_path = name and c.uploaded_by = owner)
  ) with check (
    bucket_id = 'certificates'
    and owner = auth.uid()
    and exists (select 1 from public.certificates c where c.storage_path = name and c.uploaded_by = owner)
  );
