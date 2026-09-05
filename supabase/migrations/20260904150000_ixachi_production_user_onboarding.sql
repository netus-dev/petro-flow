-- Production onboarding for the five real Ixachi users.
do $$
declare
  v_company_id uuid := 'f1000000-0000-0000-0000-000000000001';
  v_rig_702 uuid := 'f4000000-0000-0000-0000-000000000001';
  v_rig_703 uuid := 'f4000000-0000-0000-0000-000000000002';
  v_user uuid;
  v_role uuid;
begin
  insert into public.rigs (id) values (v_rig_702), (v_rig_703)
  on conflict (id) do nothing;

  for v_user, v_role in
    select * from (values
      ('4dbc406c-fb80-4943-862a-7bc84cccb9c1'::uuid, 'f2000000-0000-0000-0000-000000000001'::uuid),
      ('0d86291d-979d-4d9a-b70a-f8eefdfcdfa7'::uuid, 'f2000000-0000-0000-0000-000000000001'::uuid),
      ('07561522-9356-4193-af7e-8ec413c78347'::uuid, 'f2000000-0000-0000-0000-000000000002'::uuid),
      ('c803e640-e226-4f8b-976e-df1ab7852f68'::uuid, 'f2000000-0000-0000-0000-000000000002'::uuid),
      ('46ca8d61-7245-41b7-b4f1-12c626d8de9f'::uuid, 'f2000000-0000-0000-0000-000000000003'::uuid)
     ) as assignments(user_id, role_id)
     where exists (
       select 1 from public.users u where u.id = assignments.user_id
     )
   loop
    insert into public.rbac_principals (user_id, is_active)
    values (v_user, true)
    on conflict (user_id) do update set is_active = true;

    insert into public.rbac_memberships (company_id, user_id, is_active)
    values (v_company_id, v_user, true)
    on conflict (company_id, user_id) do update set is_active = true;

    delete from public.rbac_assignments
    where company_id = v_company_id and user_id = v_user and role_id <> v_role;
    insert into public.rbac_assignments (company_id, user_id, role_id)
    values (v_company_id, v_user, v_role)
    on conflict do nothing;

    insert into public.rbac_operational_scopes (company_id, user_id, all_rigs)
    values (v_company_id, v_user, false)
    on conflict (company_id, user_id) do update
      set all_rigs = false, updated_at = now();
    delete from public.rbac_operational_scope_rigs
    where company_id = v_company_id and user_id = v_user;
    insert into public.rbac_operational_scope_rigs (company_id, user_id, rig_id)
    values (v_company_id, v_user, case when v_user in (
      '4dbc406c-fb80-4943-862a-7bc84cccb9c1'::uuid,
      '07561522-9356-4193-af7e-8ec413c78347'::uuid
    ) then v_rig_702 else v_rig_703 end)
    on conflict do nothing;
  end loop;
end $$;
