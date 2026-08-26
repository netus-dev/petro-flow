begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001', 'rbac-active@example.test'),
  ('10000000-0000-0000-0000-000000000002', 'rbac-inactive@example.test');
insert into public.rbac_principals (user_id, is_active) values
  ('10000000-0000-0000-0000-000000000001', true),
  ('10000000-0000-0000-0000-000000000002', false);
insert into public.rbac_companies (id, name) values
  ('20000000-0000-0000-0000-000000000001', 'Fixture Company A'),
  ('20000000-0000-0000-0000-000000000002', 'Fixture Company B');
insert into public.rbac_roles (id, name) values
  ('30000000-0000-0000-0000-000000000001', 'fixture-editor');
insert into public.rbac_permissions (id, action, resource) values
  ('40000000-0000-0000-0000-000000000001', 'read', 'documents'),
  ('40000000-0000-0000-0000-000000000002', 'update', 'documents');
insert into public.rbac_role_permissions (role_id, permission_id) values
  ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002');
insert into public.rbac_memberships (company_id, user_id, is_active) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', true),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', false),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', true);
insert into public.rbac_assignments (company_id, user_id, role_id) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001');
insert into public.rbac_company_modules (company_id, module_key, enabled) values
  ('20000000-0000-0000-0000-000000000001', 'operations', true),
  ('20000000-0000-0000-0000-000000000002', 'operations', false);
insert into public.rbac_documents (id, company_id, body) values
  ('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '{"scope":"A"}'),
  ('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '{"scope":"B"}');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"20000000-0000-0000-0000-000000000001"}', true);

select ok(public.rbac_renew_authorization('20000000-0000-0000-0000-000000000001'), 'active lifecycle and membership renew');
select ok(public.rbac_has_capability('20000000-0000-0000-0000-000000000001', 'read', 'documents', 'operations'), 'role capability and enabled module authorize');
select results_eq('select body->>''scope'' from public.rbac_documents order by 1', array['A'::text], 'RLS exposes only request company');
select results_eq(
  $$update public.rbac_documents set body='{"scope":"tampered"}' where id='50000000-0000-0000-0000-000000000002' returning id$$,
  $$select null::uuid where false$$,
  'cross-company update tampering changes no rows'
);
select is(public.authorization_projection('20000000-0000-0000-0000-000000000002'), null, 'inactive membership cannot select company B');
select ok(not public.rbac_has_capability('20000000-0000-0000-0000-000000000002', 'read', 'documents', 'operations'), 'disabled company module denies capable user');
select ok(not public.rbac_has_capability('20000000-0000-0000-0000-000000000001', 'delete', 'documents', 'operations'), 'missing action-resource pair denies by default');
select ok(not public.rbac_has_capability('20000000-0000-0000-0000-000000000001', 'read', 'unknown', 'operations'), 'unknown resource denies by default');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select ok(not public.rbac_renew_authorization('20000000-0000-0000-0000-000000000001'), 'deactivated principal fails renewal');
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select ok(not public.rbac_renew_authorization('20000000-0000-0000-0000-000000000002'), 'stale company context fails renewal');
select throws_ok($$update public.rbac_audit_events set outcome='allowed'$$, '42501', 'permission denied for table rbac_audit_events', 'audit events are immutable to authenticated callers');
select is((
  select count(*) from (
    select table_name as object_name from information_schema.tables where table_schema='public'
    union all select column_name from information_schema.columns where table_schema='public'
    union all select routine_name from information_schema.routines where routine_schema='public'
  ) persisted where object_name ~* 'active[_ ]?company|company[_ ]?context|context[_ ]?revision'
), 0::bigint, 'active company and browser context are not persisted in Supabase');

select * from finish();
rollback;
