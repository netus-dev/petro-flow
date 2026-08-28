begin;
create extension if not exists pgtap with schema extensions;
select plan(28);

select is((select count(*) from public.rbac_companies where id in ('92000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000002')), 2::bigint, 'two seeded companies exist');
select is((select count(*) from public.rbac_memberships where user_id = '91000000-0000-0000-0000-000000000001'), 2::bigint, 'seed user belongs to both companies');
select is((select count(*) from public.rbac_assignments where user_id = '91000000-0000-0000-0000-000000000002'), 1::bigint, 'same-company users have different roles');
select is((select count(*) from public.rbac_memberships where user_id = '91000000-0000-0000-0000-000000000003' and not is_active), 1::bigint, 'inactive membership is seeded');
select is((select count(*) from public.rbac_role_permissions where permission_id = '94000000-0000-0000-0000-000000000001'), 3::bigint, 'global permission is reused across roles');
-- Limitation: the reconciliation RPC is revoked from API roles by design;
-- rerun checks therefore execute as the migration owner before SET ROLE.

set local role anon;
select throws_ok($$select * from public.rbac_documents$$, '42501', 'permission denied for table rbac_documents', 'anon cannot select documents');
select throws_ok($$select public.rbac_has_capability(null, 'read', 'documents', null)$$, '42501', 'permission denied for function rbac_has_capability', 'anon cannot execute authorization RPC');
select is((select count(*) from storage.objects where bucket_id = 'certificates'), 0::bigint, 'anon cannot select storage objects');

set local role authenticated;
select set_config('request.jwt.claim.sub', '91000000-0000-0000-0000-000000000001', true);
select set_config('request.headers', '{"x-company-id":"92000000-0000-0000-0000-000000000001"}', true);
select ok(public.rbac_renew_authorization('92000000-0000-0000-0000-000000000001'), 'active user and company renew authorization');
select ok(public.rbac_has_capability('92000000-0000-0000-0000-000000000001', 'read', 'documents', 'operations'), 'manager receives global read capability');
select is((select count(*) from public.rbac_documents), 1::bigint, 'select is limited to request company');
select is((select count(*) from public.rbac_documents where id = '95000000-0000-0000-0000-000000000002'), 0::bigint, 'cross-company select is denied');
select is((select count(*) from public.rbac_documents where id = '95000000-0000-0000-0000-000000000001' and body->>'fixture' = 'north'), 1::bigint, 'same-company row is visible');
select throws_ok($$insert into public.rbac_documents(company_id, body) values ('92000000-0000-0000-0000-000000000001', '{}')$$, '42501', 'permission denied for table rbac_documents', 'insert is denied without insert grant');
select results_eq($$update public.rbac_documents set body='{"fixture":"changed"}' where id='95000000-0000-0000-0000-000000000001' returning id$$, $$values ('95000000-0000-0000-0000-000000000001'::uuid)$$, 'manager can update same-company document');
select throws_ok($$delete from public.rbac_documents where id = '95000000-0000-0000-0000-000000000001'$$, '42501', 'permission denied for table rbac_documents', 'delete is denied without delete grant');
select ok(not public.rbac_has_capability('92000000-0000-0000-0000-000000000002', 'read', 'documents', 'operations'), 'inactive company denies capability');
select ok(not public.rbac_has_capability('92000000-0000-0000-0000-000000000001', 'delete', 'documents', null), 'missing permission denies capability');
select is(public.authorization_projection('92000000-0000-0000-0000-000000000002'), null, 'inactive company projection is null');
select throws_ok($$insert into public.rbac_assignments(company_id,user_id,role_id) values ('92000000-0000-0000-0000-000000000001','91000000-0000-0000-0000-000000000001','93000000-0000-0000-0000-000000000003')$$, '42501', 'permission denied for table rbac_assignments', 'role assignment without authorized membership is denied');

select is((select count(*) from storage.objects where bucket_id = 'certificates'), 1::bigint, 'owner sees only matching storage path');
select throws_ok($$insert into storage.objects(id,bucket_id,name,owner,metadata) values ('9a000000-0000-0000-0000-000000000003','certificates','seed/unknown.pdf',auth.uid(),'{}')$$, '42501', 'new row violates row-level security policy for table "objects"', 'storage path mismatch is denied');
select throws_ok($$insert into storage.objects(id,bucket_id,name,owner,metadata) values ('9a000000-0000-0000-0000-000000000004','certificates','seed/valid-document.pdf','91000000-0000-0000-0000-000000000002','{}')$$, '42501', 'new row violates row-level security policy for table "objects"', 'storage owner mismatch is denied');
select results_eq($$update storage.objects set metadata='{}' where name='seed/path-mismatch.pdf' returning id$$, $$select null::uuid where false$$, 'mismatched object cannot be updated');

select ok((select proconfig @> array['search_path=""']::text[] from pg_proc where oid = 'public.rbac_has_capability(uuid,text,text,text)'::regprocedure), 'authorization RPC has empty search_path');
select ok(has_function_privilege('authenticated', 'public.rbac_has_capability(uuid,text,text,text)', 'EXECUTE'), 'authenticated has RPC execute grant');
select ok(not has_function_privilege('anon', 'public.rbac_has_capability(uuid,text,text,text)', 'EXECUTE'), 'anon lacks RPC execute grant');
select ok((select count(*) from public.rbac_documents) = 1, 'transactional checks preserve seeded baseline');
select * from finish();
rollback;
