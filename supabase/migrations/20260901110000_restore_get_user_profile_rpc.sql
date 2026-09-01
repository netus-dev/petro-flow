-- Restore the profile aggregation RPC used by the authenticated login flow.
create or replace function public.get_user_profile(p_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'profile', (
      select to_jsonb(u)
      from public.users u
      where u.id = p_user_id
        and u.id = auth.uid()
    ),
    'company', (
      select jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'created_at', null,
        'description', null
      )
      from public.rbac_companies c
      join public.rbac_memberships m on m.company_id = c.id
      where m.user_id = p_user_id
        and m.is_active
        and c.is_active
        and c.id = coalesce(
          public.rbac_request_company_id(),
          (select m2.company_id
           from public.rbac_memberships m2
           join public.rbac_companies c2 on c2.id = m2.company_id
           where m2.user_id = p_user_id and m2.is_active and c2.is_active
           order by c2.name
           limit 1)
        )
    ),
    'roles', (
      select coalesce(
        jsonb_agg(jsonb_build_object('id', r.id, 'name', r.name) order by r.name),
        '[]'::jsonb
      )
      from public.rbac_roles r
      join public.rbac_assignments a on a.role_id = r.id
      where a.user_id = p_user_id
        and a.company_id = coalesce(
          public.rbac_request_company_id(),
          (select m2.company_id
           from public.rbac_memberships m2
           join public.rbac_companies c2 on c2.id = m2.company_id
           where m2.user_id = p_user_id and m2.is_active and c2.is_active
           order by c2.name
           limit 1)
        )
    ),
    'permissions', (
      select coalesce(
        jsonb_agg(distinct p.action || '.' || p.resource order by p.action || '.' || p.resource),
        '[]'::jsonb
      )
      from public.rbac_permissions p
      join public.rbac_role_permissions rp on rp.permission_id = p.id
      join public.rbac_assignments a on a.role_id = rp.role_id
      where a.user_id = p_user_id
        and a.company_id = coalesce(
          public.rbac_request_company_id(),
          (select m2.company_id
           from public.rbac_memberships m2
           join public.rbac_companies c2 on c2.id = m2.company_id
           where m2.user_id = p_user_id and m2.is_active and c2.is_active
           order by c2.name
           limit 1)
        )
    )
  )
$$;

revoke all on function public.get_user_profile(uuid) from public, anon;
grant execute on function public.get_user_profile(uuid) to authenticated;
