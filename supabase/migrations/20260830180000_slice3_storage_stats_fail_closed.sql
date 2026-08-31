-- Slice 3: keep certificate Storage and the legacy statistics RPC fail closed.
-- certificates has no company_id; ownership is only derivable through asset_id.
-- storage.objects has no trusted certificate/company binding beyond its path.

-- Storage ACLs are managed internally by Supabase; effective access is tested
-- through RLS and the absence of certificate policies below.

drop policy if exists certificates_select_owned on storage.objects;
drop policy if exists certificates_insert_owned on storage.objects;
drop policy if exists certificates_update_owned on storage.objects;
drop policy if exists certificates_delete_owned on storage.objects;

revoke all on function public.get_asset_stats_by_functional_principle(uuid)
  from public, anon, authenticated;
grant execute on function public.get_asset_stats_by_functional_principle(uuid)
  to service_role;
