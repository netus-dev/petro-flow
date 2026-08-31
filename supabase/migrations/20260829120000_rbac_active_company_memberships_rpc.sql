create function public.rbac_active_company_memberships()
returns table(company_id uuid, company_name text)
language sql stable security definer set search_path = '' as $$
  select m.company_id, c.name
  from public.rbac_memberships m
  join public.rbac_principals p on p.user_id = m.user_id
  join public.rbac_companies c on c.id = m.company_id
  where m.user_id = auth.uid() and p.is_active and m.is_active and c.is_active
  order by c.name
$$;
revoke all on function public.rbac_active_company_memberships() from public;
grant execute on function public.rbac_active_company_memberships() to authenticated;
