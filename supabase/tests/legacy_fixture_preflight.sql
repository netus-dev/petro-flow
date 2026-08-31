-- Read-only local fixture preflight. Run after `supabase db reset`.
do $$
begin
  if to_regclass('public.companies') is not null then raise exception 'legacy companies table was not retired'; end if;
  if (select count(*) from public.users u join auth.users au on au.id = u.id where u.id in ('a1000000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-0000-0000-000000000002'::uuid, 'a1000000-0000-0000-0000-000000000003'::uuid)) <> 3 then raise exception 'legacy users are not auth-linked'; end if;
  if (select count(*) from public.roles r join public.rbac_companies c on c.id = r.company_id where r.id in ('a3000000-0000-0000-0000-000000000001'::uuid, 'a3000000-0000-0000-0000-000000000002'::uuid)) <> 2 then raise exception 'legacy role company references incomplete'; end if;
  if (select count(*) from public.role_permissions rp join public.user_roles ur on ur.role_id = rp.role_id where ur.user_id = 'a1000000-0000-0000-0000-000000000001'::uuid) <> 1 then raise exception 'legacy RBAC joins incomplete'; end if;
  if not exists (select 1 from public.certificates where uploaded_by = 'a1000000-0000-0000-0000-000000000001'::uuid) then raise exception 'legacy certificate reference missing'; end if;
  if to_regclass('public.rbac_companies') is null or to_regclass('public.rbac_memberships') is null then raise exception 'canonical RBAC tables missing'; end if;
end
$$;
