-- Keep the access-control admin boundary aligned with the tenant-aware capability API.
create or replace function public.rbac_admin_allowed() returns boolean
language sql stable security definer set search_path = '' as $$
  select public.rbac_has_capability(
    public.rbac_request_company_id(),
    'manage',
    'access-control',
    'operations'
  )
$$;
