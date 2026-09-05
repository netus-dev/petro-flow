-- Access-control administration is gated by the access-control module itself.
create or replace function public.rbac_admin_allowed() returns boolean
language sql stable security definer set search_path = '' as $$
  select public.rbac_has_capability(
    public.rbac_request_company_id(),
    'manage',
    'access-control',
    'access-control'
  )
$$;
