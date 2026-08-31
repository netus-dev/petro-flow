begin;
create extension if not exists pgtap with schema extensions;
select plan(52);

insert into auth.users (id, email) values
  ('d1000000-0000-0000-0000-000000000001', 'hardening-user@example.test')
on conflict (id) do nothing;
insert into public.rbac_principals (user_id, is_active) values
  ('d1000000-0000-0000-0000-000000000001', true)
on conflict (user_id) do update set is_active = excluded.is_active;
insert into public.rbac_companies (id, name, is_active) values
  ('d2000000-0000-0000-0000-000000000001', 'Hardening Company A', true),
  ('d2000000-0000-0000-0000-000000000002', 'Hardening Company B', true),
  ('d2000000-0000-0000-0000-000000000003', 'Hardening Company Inactive', true)
on conflict (id) do update set is_active = excluded.is_active;
insert into public.rbac_memberships (company_id, user_id, is_active) values
  ('d2000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', true),
  ('d2000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', true),
  ('d2000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', false)
on conflict (company_id, user_id) do update set is_active = excluded.is_active;
insert into public.rbac_roles (id, name, company_id) values
  ('d3000000-0000-0000-0000-000000000001', 'hardening-auditor', 'd2000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;
insert into public.rbac_role_permissions (role_id, permission_id)
select 'd3000000-0000-0000-0000-000000000001', id
from public.rbac_permissions where action = 'manage' and resource = 'access-control'
on conflict do nothing;
insert into public.rbac_assignments (company_id, user_id, role_id) values
  ('d2000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'd3000000-0000-0000-0000-000000000001')
on conflict do nothing;
insert into public.certificates (id, company_id, storage_path, uploaded_by) values
  ('d6000000-0000-0000-0000-000000000001', 'd2000000-0000-0000-0000-000000000001', 'hardening-owned.pdf', '10000000-0000-0000-0000-000000000001')
on conflict (id) do update set company_id = excluded.company_id, storage_path = excluded.storage_path, uploaded_by = excluded.uploaded_by;

set local role anon;
select throws_ok($$select * from public.assets$$, '42501', 'permission denied for table assets', 'anon cannot select assets');
select throws_ok($$insert into public.assets default values$$, '42501', 'permission denied for table assets', 'anon cannot insert assets');
select throws_ok($$update public.assets set is_active = false$$, '42501', 'permission denied for table assets', 'anon cannot update assets');
select throws_ok($$delete from public.assets$$, '42501', 'permission denied for table assets', 'anon cannot delete assets');
select throws_ok($$select * from public.certificates$$, '42501', 'permission denied for table certificates', 'anon cannot select certificates');
select throws_ok($$insert into public.certificates default values$$, '42501', 'permission denied for table certificates', 'anon cannot insert certificates');
select throws_ok($$update public.certificates set storage_path = storage_path$$, '42501', 'permission denied for table certificates', 'anon cannot update certificates');
select throws_ok($$delete from public.certificates$$, '42501', 'permission denied for table certificates', 'anon cannot delete certificates');
select throws_ok($$select * from public.locations$$, '42501', 'permission denied for table locations', 'anon cannot select locations');
select throws_ok($$select * from public.functional_principles$$, '42501', 'permission denied for table functional_principles', 'anon cannot select functional principles');
select throws_ok($$select * from public.ubications$$, '42501', 'permission denied for table ubications', 'anon cannot select ubications');
select throws_ok(
  $$select * from public.get_asset_stats_by_functional_principle('40000000-0000-0000-0000-000000000001')$$,
  '42501',
  'permission denied for function get_asset_stats_by_functional_principle',
  'anon cannot execute asset statistics'
);
select is((select count(*) from storage.objects where bucket_id = 'certificates'), 0::bigint, 'anon cannot select certificate storage objects');
select throws_ok(
  $$insert into storage.objects (id, bucket_id, name, owner, metadata) values ('d7000000-0000-0000-0000-000000000001', 'certificates', 'anon-denied.pdf', null, '{}'::jsonb)$$,
  '42501', null, 'anon cannot insert certificate storage objects'
);
select results_eq(
  $$update storage.objects set metadata = '{"denied":true}' where bucket_id = 'certificates' returning id$$,
  $$select null::uuid where false$$,
  'anon cannot update certificate storage objects'
);
select throws_ok(
  $$delete from storage.objects where bucket_id = 'certificates'$$,
  '42501', 'Direct deletion from storage tables is not allowed. Use the Storage API instead.',
  'anon cannot directly delete certificate storage objects'
);

reset role;
select ok(not exists (
  select 1
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('r', 'p')
    and (
      has_table_privilege('anon', c.oid, 'SELECT')
      or has_table_privilege('anon', c.oid, 'INSERT')
      or has_table_privilege('anon', c.oid, 'UPDATE')
      or has_table_privilege('anon', c.oid, 'DELETE')
    )
), 'anon has no CRUD privilege on public business tables');
select ok(not exists (
  select 1
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and has_function_privilege('anon', p.oid, 'EXECUTE')
), 'anon cannot execute any public function');
select ok((
  select bool_and(c.relrowsecurity)
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in ('assets', 'certificates', 'locations', 'functional_principles', 'ubications')
), 'exposed business tables have RLS enabled');
select results_eq(
  $$
    select p.oid::regprocedure::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and has_function_privilege('authenticated', p.oid, 'EXECUTE')
    order by 1
  $$,
  $$values
    ('authorization_projection(uuid)'::text),
    ('rbac_active_company_memberships()'::text),
    ('rbac_can_read_catalog(uuid)'::text),
    ('rbac_has_capability(uuid,text,text,text)'::text),
    ('rbac_record_audit(uuid,text,text,jsonb)'::text),
    ('rbac_renew_authorization(uuid)'::text),
    ('rbac_request_company_id()'::text)
  $$,
  'authenticated has exactly the reviewed public RPC identities'
);
select ok(not exists (
  select 1
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in (
      'locations', 'functional_principles', 'ubications', 'brands', 'models',
      'suppliers', 'wells', 'operating_bases', 'rigs'
    )
    and (
      not has_table_privilege('authenticated', c.oid, 'SELECT')
      or has_table_privilege('authenticated', c.oid, 'INSERT')
      or has_table_privilege('authenticated', c.oid, 'UPDATE')
      or has_table_privilege('authenticated', c.oid, 'DELETE')
    )
), 'authenticated tenant catalog grants are read-only');
select results_eq(
  $$
    select p.oid::regprocedure::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and has_function_privilege('service_role', p.oid, 'EXECUTE')
    order by 1
  $$,
  $$values
    ('authorization_projection(uuid)'::text),
    ('get_asset_stats_by_functional_principle(uuid)'::text),
    ('handle_new_user()'::text),
    ('rbac_active_company_memberships()'::text),
    ('rbac_can_read_catalog(uuid)'::text),
    ('rbac_has_capability(uuid,text,text,text)'::text),
    ('rbac_record_audit(uuid,text,text,jsonb)'::text),
    ('rbac_rehearse_retire_companies()'::text),
    ('rbac_reject_audit_mutation()'::text),
    ('rbac_renew_authorization(uuid)'::text),
    ('rbac_request_company_id()'::text)
  $$,
  'service role retains exactly the reviewed public function identities'
);
select is((
  select count(*)
  from pg_policies
  where schemaname = 'storage'
    and tablename = 'objects'
    and policyname in ('certificates_select_owned', 'certificates_insert_owned', 'certificates_update_owned')
), 0::bigint, 'certificate storage has no positive web policies');
select ok(to_regnamespace('rbac_private') is null, 'obsolete private storage helper schema is absent');
select ok(
  not has_sequence_privilege('anon', 'public.rbac_audit_events_id_seq', 'USAGE')
  and not has_sequence_privilege('anon', 'public.rbac_audit_events_id_seq', 'SELECT')
  and not has_sequence_privilege('anon', 'public.rbac_audit_events_id_seq', 'UPDATE'),
  'anon has no audit sequence privileges'
);
select ok(
  not has_sequence_privilege('authenticated', 'public.rbac_audit_events_id_seq', 'USAGE')
  and not has_sequence_privilege('authenticated', 'public.rbac_audit_events_id_seq', 'SELECT')
  and not has_sequence_privilege('authenticated', 'public.rbac_audit_events_id_seq', 'UPDATE'),
  'authenticated has no audit sequence privileges'
);
select ok(
  has_sequence_privilege('service_role', 'public.rbac_audit_events_id_seq', 'USAGE')
  and has_sequence_privilege('service_role', 'public.rbac_audit_events_id_seq', 'SELECT')
  and has_sequence_privilege('service_role', 'public.rbac_audit_events_id_seq', 'UPDATE'),
  'service role retains audit sequence privileges'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'd1000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.headers', '{"x-company-id":"d2000000-0000-0000-0000-000000000001"}', true);
select is((select count(*) from public.assets), 0::bigint, 'authenticated cannot read unowned assets');
select throws_ok($$insert into public.assets default values$$, '42501', null, 'authenticated cannot insert without ownership');
select is((select count(*) from public.assets where is_active = false), 0::bigint, 'authenticated cannot update unowned assets');
select is((select count(*) from public.assets), 0::bigint, 'authenticated cannot delete unowned assets');
select is((select count(*) from public.certificates), 0::bigint, 'authenticated cannot read certificates without owned assets');
select throws_ok($$insert into public.certificates default values$$, '42501', null, 'authenticated cannot insert certificate without ownership');
select is((select count(*) from public.certificates), 0::bigint, 'authenticated cannot update unowned certificates');
select is((select count(*) from public.certificates), 0::bigint, 'authenticated cannot delete unowned certificates');
select throws_ok(
  $$select * from public.get_asset_stats_by_functional_principle('40000000-0000-0000-0000-000000000001')$$,
  '42501',
  'permission denied for function get_asset_stats_by_functional_principle',
  'authenticated cannot execute asset statistics'
);
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select is((select count(*) from storage.objects where bucket_id = 'certificates'), 0::bigint, 'authenticated owner cannot select certificate storage objects');
select throws_ok(
  $$insert into storage.objects (id, bucket_id, name, owner, metadata) values ('d7000000-0000-0000-0000-000000000002', 'certificates', 'hardening-owned.pdf', auth.uid(), '{}'::jsonb)$$,
  '42501', null, 'authenticated owner cannot insert certificate storage objects'
);
select results_eq(
  $$update storage.objects set metadata = '{"denied":true}' where bucket_id = 'certificates' and owner = auth.uid() returning id$$,
  $$select null::uuid where false$$,
  'authenticated owner cannot update certificate storage objects'
);
select throws_ok(
  $$delete from storage.objects where bucket_id = 'certificates' and owner = auth.uid()$$,
  '42501', 'Direct deletion from storage tables is not allowed. Use the Storage API instead.',
  'authenticated owner cannot directly delete certificate storage objects'
);
select set_config('request.jwt.claim.sub', 'd1000000-0000-0000-0000-000000000001', true);
select throws_ok(
  $$select public.rbac_record_audit('d2000000-0000-0000-0000-000000000002', 'spoofed', 'denied', '{}'::jsonb)$$,
  '42501',
  'audit company must match an active request company',
  'authenticated cannot spoof the audit company'
);
select set_config('request.headers', '{}', true);
select is((
  select count(*)
  from (
    select id from public.locations
    union all select id from public.functional_principles
    union all select id from public.ubications
  ) denied_catalogs
), 0::bigint, 'catalog reads without a request company fail closed');
select throws_ok(
  $$select public.rbac_record_audit('d2000000-0000-0000-0000-000000000001', 'missing-context', 'denied', '{}'::jsonb)$$,
  '42501', 'audit company must match an active request company', 'audit recording without request company is denied'
);
select set_config('request.headers', '{"x-company-id":"d2000000-0000-0000-0000-000000000003"}', true);
select throws_ok(
  $$select public.rbac_record_audit('d2000000-0000-0000-0000-000000000003', 'inactive-context', 'denied', '{}'::jsonb)$$,
  '42501', 'audit company must match an active request company', 'audit recording for an inactive membership is denied'
);
select set_config('request.headers', '{"x-company-id":"d2000000-0000-0000-0000-000000000001"}', true);
select is(public.rbac_request_company_id(), 'd2000000-0000-0000-0000-000000000001'::uuid, 'authenticated reads the request company');
select ok(public.rbac_renew_authorization('d2000000-0000-0000-0000-000000000001'), 'authenticated can renew an active company');
select ok(not public.rbac_has_capability('d2000000-0000-0000-0000-000000000001', 'read', 'documents', null), 'authenticated capability checks still deny missing assignments');
select isnt(public.authorization_projection('d2000000-0000-0000-0000-000000000001'), null::jsonb, 'authenticated can obtain an authorized projection');
select is((select count(*) from public.rbac_active_company_memberships()), 2::bigint, 'authenticated can list active company memberships');
select ok(not public.rbac_can_read_catalog('d2000000-0000-0000-0000-000000000001'), 'authenticated catalog checks still deny missing capability');
select lives_ok(
  $$select public.rbac_record_audit('d2000000-0000-0000-0000-000000000001', 'hardening-test', 'allowed', '{}'::jsonb)$$,
  'authenticated can record an audit event for the active request company'
);

reset role;
select is((
  select count(*)
  from public.rbac_audit_events
  where actor_id = 'd1000000-0000-0000-0000-000000000001'
    and company_id = 'd2000000-0000-0000-0000-000000000001'
    and event_type = 'hardening-test'
), 1::bigint, 'valid audit recording preserves actor and company');

select * from finish();
rollback;
