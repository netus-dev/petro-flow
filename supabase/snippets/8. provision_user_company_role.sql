-- Provision an existing Supabase Auth user in one active company.
-- Copy a reviewed source-role permission set and apply an explicit per-user operational scope mode.
-- Scope modes: copy_source, all_rigs (this company only), or none. This does not create an Auth account or change company modules.
-- Review the values and expected snapshots before each run; the DO block is atomic.
-- Source rows are locked and copied from arrays captured in this transaction to prevent drift.
-- This SQL-admin path does not fabricate an authenticated actor or write an actor-attributed app audit event.
-- Use the authenticated access-control provisioning flow when an actor-attributed audit event is required.
do $$
declare
  v_company_id uuid := 'f1000000-0000-0000-0000-000000000001';
  v_target_user_id uuid := '3d595e9d-c30d-4790-bf53-4cbc93d2b100';
  v_source_role_name text := 'Tool Pusher';
  v_target_role_name text := 'Rig Manager';
  -- Choose copy_source, all_rigs, or none. all_rigs applies only to this user in v_company_id.
  v_scope_mode text := 'all_rigs';
  -- Required only for copy_source mode; leave NULL for all_rigs or none.
  v_scope_source_user_id uuid := null;
  -- Reviewed live Tool Pusher snapshot; update only after an explicit permission review.
  v_expected_permissions text[] := ARRAY[
    'create:assets',
    'create:certificates',
    'create:movements',
    'delete:assets',
    'delete:certificates',
    'manage:hour-meters',
    'read:assets',
    'read:catalogs',
    'read:certificates',
    'read:hour-meters',
    'read:movements',
    'read:trazabilidad',
    'register:hour-meters',
    'update:assets',
    'update:certificates',
    'update:hour-meters'
  ]::text[];
  -- Reviewed source scope for copy_source mode; update only after explicit scope approval.
  v_expected_scope_rig_ids uuid[] := ARRAY['f4000000-0000-0000-0000-000000000002']::uuid[];

  v_locked_company_id uuid;
  v_locked_auth_user_id uuid;
  v_profile_is_active boolean;
  v_principal_is_active boolean;
  v_membership_is_active boolean;
  v_source_role_id uuid;
  v_target_role_id uuid;
  v_permission_count integer;
  v_actual_permissions text[];
  v_target_permissions text[];
  v_source_permission_ids uuid[];
  v_source_scope_all_rigs boolean;
  v_source_scope_rig_ids uuid[];
  v_target_scope_all_rigs boolean;
  v_target_scope_rig_ids uuid[];
  v_valid_rig_count integer;
begin
  if v_source_role_name = v_target_role_name then
    raise exception 'Source and target role names must differ';
  end if;
  if v_scope_mode is null or v_scope_mode not in ('copy_source', 'all_rigs', 'none') then
    raise exception 'Unsupported scope mode: %', v_scope_mode;
  end if;
  if v_scope_mode = 'copy_source' and v_scope_source_user_id is null then
    raise exception 'A scope source user is required for copy_source mode';
  end if;
  if v_scope_mode <> 'copy_source' and v_scope_source_user_id is not null then
    raise exception 'A scope source user may only be set for copy_source mode';
  end if;

  select id into v_locked_company_id
  from public.rbac_companies
  where id = v_company_id and is_active
  for share;
  if not found then
    raise exception 'Company was not found or is inactive: %', v_company_id;
  end if;

  select id into v_locked_auth_user_id
  from auth.users
  where id = v_target_user_id
  for share;
  if not found then
    raise exception 'Auth user was not found: %; create/invite the Auth user before running this snippet', v_target_user_id;
  end if;

  select id into v_source_role_id
  from public.rbac_roles
  where company_id = v_company_id and name = v_source_role_name
  for update;
  if not found then
    raise exception 'Source role was not found in company %: %', v_company_id, v_source_role_name;
  end if;

  -- Lock existing source links; the source role lock prevents new FK-linked permissions until commit.
  perform 1
  from public.rbac_role_permissions rp
  where rp.role_id = v_source_role_id
  for update;

  -- Lock the referenced permission definitions as their action/resource labels form the approved snapshot.
  perform 1
  from public.rbac_permissions p
  join public.rbac_role_permissions rp on rp.permission_id = p.id
  where rp.role_id = v_source_role_id
  for share of p;

  select coalesce(array_agg(p.action || ':' || p.resource order by p.action, p.resource), ARRAY[]::text[]),
         coalesce(array_agg(rp.permission_id order by p.action, p.resource), ARRAY[]::uuid[])
  into v_actual_permissions, v_source_permission_ids
  from public.rbac_role_permissions rp
  join public.rbac_permissions p on p.id = rp.permission_id
  where rp.role_id = v_source_role_id;
  if v_actual_permissions is distinct from v_expected_permissions then
    raise exception 'Source role permission snapshot changed; review before copying. Current snapshot: %', v_actual_permissions;
  end if;
  v_permission_count := cardinality(v_actual_permissions);

  if v_scope_mode = 'copy_source' then
    perform 1
    from public.rbac_assignments a
    where a.company_id = v_company_id
      and a.user_id = v_scope_source_user_id
      and a.role_id = v_source_role_id
    for share;
    if not found then
      raise exception 'Scope source user is not assigned to source role % in company %', v_source_role_name, v_company_id;
    end if;

    select all_rigs into v_source_scope_all_rigs
    from public.rbac_operational_scopes
    where company_id = v_company_id and user_id = v_scope_source_user_id
    for update;
    if not found then
      raise exception 'Scope source user has no operational scope in company %', v_company_id;
    end if;

    -- Lock existing scope rows; the scope root lock prevents new FK-linked rig rows until commit.
    perform 1
    from public.rbac_operational_scope_rigs
    where company_id = v_company_id and user_id = v_scope_source_user_id
    for update;

    select coalesce(array_agg(rig_id order by rig_id), ARRAY[]::uuid[])
    into v_source_scope_rig_ids
    from public.rbac_operational_scope_rigs
    where company_id = v_company_id and user_id = v_scope_source_user_id;

    if v_source_scope_all_rigs is distinct from false
       or v_source_scope_rig_ids is distinct from v_expected_scope_rig_ids then
      raise exception 'Scope source changed; expected only the approved Rig 703 specific scope';
    end if;

    -- Hold each approved location row stable and verify it remains an active rig in this company.
    perform 1
    from public.locations location
    where location.id = any(v_source_scope_rig_ids)
      and location.company_id = v_company_id
      and location.type::text = 'rig'
      and location.is_active
    for share;

    select count(*) into v_valid_rig_count
    from public.locations location
    where location.id = any(v_source_scope_rig_ids)
      and location.company_id = v_company_id
      and location.type::text = 'rig'
      and location.is_active;
    if v_valid_rig_count <> cardinality(v_source_scope_rig_ids) then
      raise exception 'Scope source contains an inactive or cross-company rig';
    end if;
  end if;

  -- Create or serialize access to the company-scoped target role before checking its current grants.
  insert into public.rbac_roles (company_id, name)
  values (v_company_id, v_target_role_name)
  on conflict (company_id, name) do nothing;

  select id into v_target_role_id
  from public.rbac_roles
  where company_id = v_company_id and name = v_target_role_name
  for update;
  if not found then
    raise exception 'Target role could not be created or resolved: %', v_target_role_name;
  end if;

  perform 1
  from public.rbac_role_permissions rp
  where rp.role_id = v_target_role_id
  for update;

  perform 1
  from public.rbac_permissions p
  join public.rbac_role_permissions rp on rp.permission_id = p.id
  where rp.role_id = v_target_role_id
  for share of p;

  -- Do not silently remove custom grants or expand access for existing target-role members.
  if exists (
    select 1
    from public.rbac_role_permissions target_permission
    where target_permission.role_id = v_target_role_id
      and not (target_permission.permission_id = any(v_source_permission_ids))
  ) then
    raise exception 'Target role % has extra permissions; review them before syncing from %', v_target_role_name, v_source_role_name;
  end if;

  if exists (
    select 1
    from public.rbac_assignments a
    where a.company_id = v_company_id
      and a.role_id = v_target_role_id
      and a.user_id <> v_target_user_id
  ) and exists (
    select 1
    from unnest(v_source_permission_ids) source_permission(permission_id)
    where not exists (
      select 1
      from public.rbac_role_permissions target_permission
      where target_permission.role_id = v_target_role_id
        and target_permission.permission_id = source_permission.permission_id
    )
  ) then
    raise exception 'Adding missing source permissions would change access for other members of %; review manually', v_target_role_name;
  end if;

  select is_active into v_profile_is_active
  from public.users
  where id = v_target_user_id
  for update;
  if found and v_profile_is_active is false then
    raise exception 'Public user profile is inactive; review it before provisioning';
  end if;

  -- Preserve existing profile data. Auth creation/invitation is a separate step.
  insert into public.users (id, email, name)
  select u.id,
         coalesce(u.email, ''),
         coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), 'New User')
  from auth.users u
  where u.id = v_target_user_id
  on conflict (id) do nothing;

  select is_active into v_profile_is_active
  from public.users
  where id = v_target_user_id
  for update;
  if not found or v_profile_is_active is not true then
    raise exception 'An active public user profile is required before provisioning';
  end if;

  select is_active into v_principal_is_active
  from public.rbac_principals
  where user_id = v_target_user_id
  for update;
  if found and v_principal_is_active is false then
    raise exception 'RBAC principal is inactive; review before reactivating';
  end if;

  insert into public.rbac_principals (user_id, is_active)
  values (v_target_user_id, true)
  on conflict (user_id) do nothing;

  select is_active into v_principal_is_active
  from public.rbac_principals
  where user_id = v_target_user_id
  for update;
  if not found or v_principal_is_active is not true then
    raise exception 'An active RBAC principal is required before provisioning';
  end if;

  select is_active into v_membership_is_active
  from public.rbac_memberships
  where company_id = v_company_id and user_id = v_target_user_id
  for update;
  if found and v_membership_is_active is false then
    raise exception 'Company membership is inactive; review before reactivating';
  end if;

  insert into public.rbac_memberships (company_id, user_id, is_active)
  values (v_company_id, v_target_user_id, true)
  on conflict (company_id, user_id) do nothing;

  select is_active into v_membership_is_active
  from public.rbac_memberships
  where company_id = v_company_id and user_id = v_target_user_id
  for update;
  if not found or v_membership_is_active is not true then
    raise exception 'An active company membership is required before provisioning';
  end if;

  -- Copy only the permission IDs captured and validated while the source rows were locked.
  insert into public.rbac_role_permissions (role_id, permission_id)
  select v_target_role_id, source_permission.permission_id
  from unnest(v_source_permission_ids) source_permission(permission_id)
  on conflict (role_id, permission_id) do nothing;

  select coalesce(array_agg(p.action || ':' || p.resource order by p.action, p.resource), ARRAY[]::text[])
  into v_target_permissions
  from public.rbac_role_permissions rp
  join public.rbac_permissions p on p.id = rp.permission_id
  where rp.role_id = v_target_role_id;
  if v_target_permissions is distinct from v_expected_permissions then
    raise exception 'Target role permission set does not match the reviewed source snapshot';
  end if;

  -- Add the target role without removing any other role already assigned to this user.
  insert into public.rbac_assignments (company_id, user_id, role_id)
  values (v_company_id, v_target_user_id, v_target_role_id)
  on conflict (company_id, user_id, role_id) do nothing;

  if v_scope_mode = 'copy_source' then
    -- Allow a new/empty restricted scope or an exact match; conflicting scopes fail below.
    insert into public.rbac_operational_scopes (company_id, user_id, all_rigs)
    values (v_company_id, v_target_user_id, v_source_scope_all_rigs)
    on conflict (company_id, user_id) do nothing;

    select all_rigs into v_target_scope_all_rigs
    from public.rbac_operational_scopes
    where company_id = v_company_id and user_id = v_target_user_id
    for update;
    if not found then
      raise exception 'Target operational scope could not be created or resolved';
    end if;

    perform 1
    from public.rbac_operational_scope_rigs
    where company_id = v_company_id and user_id = v_target_user_id
    for update;

    select coalesce(array_agg(rig_id order by rig_id), ARRAY[]::uuid[])
    into v_target_scope_rig_ids
    from public.rbac_operational_scope_rigs
    where company_id = v_company_id and user_id = v_target_user_id;

    if v_target_scope_all_rigs is distinct from v_source_scope_all_rigs
       or (
         cardinality(v_target_scope_rig_ids) > 0
         and v_target_scope_rig_ids is distinct from v_source_scope_rig_ids
       ) then
      raise exception 'Target already has a different operational rig scope; review before changing it';
    end if;

    insert into public.rbac_operational_scope_rigs (company_id, user_id, rig_id)
    select v_company_id, v_target_user_id, source_scope.rig_id
    from unnest(v_source_scope_rig_ids) source_scope(rig_id)
    on conflict (company_id, user_id, rig_id) do nothing;

    select coalesce(array_agg(rig_id order by rig_id), ARRAY[]::uuid[])
    into v_target_scope_rig_ids
    from public.rbac_operational_scope_rigs
    where company_id = v_company_id and user_id = v_target_user_id;
    if v_target_scope_all_rigs is distinct from false
       or v_target_scope_rig_ids is distinct from v_expected_scope_rig_ids then
      raise exception 'Target operational scope does not match the approved Rig 703 scope';
    end if;
  end if;

  if v_scope_mode = 'all_rigs' then
    -- Explicit all-rigs authorization applies only to this user and this company; preserve existing rig-link rows.
    insert into public.rbac_operational_scopes (company_id, user_id, all_rigs)
    values (v_company_id, v_target_user_id, true)
    on conflict (company_id, user_id) do nothing;

    select all_rigs into v_target_scope_all_rigs
    from public.rbac_operational_scopes
    where company_id = v_company_id and user_id = v_target_user_id
    for update;
    if not found then
      raise exception 'Target operational scope could not be created or resolved';
    end if;

    if v_target_scope_all_rigs is distinct from true then
      update public.rbac_operational_scopes
      set all_rigs = true, updated_at = now()
      where company_id = v_company_id and user_id = v_target_user_id;
    end if;

    select all_rigs into v_target_scope_all_rigs
    from public.rbac_operational_scopes
    where company_id = v_company_id and user_id = v_target_user_id
    for update;
    if not found or v_target_scope_all_rigs is distinct from true then
      raise exception 'Target operational scope is not all-rigs as explicitly requested';
    end if;
  end if;

  raise notice 'Provisioned user % in company % with role %, % reviewed permissions, scope mode %',
    v_target_user_id, v_company_id, v_target_role_name, v_permission_count, v_scope_mode;
end;
$$;
