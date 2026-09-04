begin;
create extension if not exists pgtap with schema extensions;
select plan(21);

select ok(exists (select 1 from storage.buckets where id = 'certificates' and name = 'certificates' and not public and allowed_mime_types = array['application/pdf', 'image/*']::text[]), 'certificates bucket is private and MIME restricted');
select ok((select relrowsecurity from pg_class where oid = 'public.certificates'::regclass), 'certificates RLS is enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.assets_certificates'::regclass), 'certificate links RLS is enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.transactions'::regclass), 'transactions RLS is enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.transaction_details'::regclass), 'transaction details RLS is enabled');
select policies_are('public', 'certificates', array['certificates_traceability_read', 'certificates_traceability_write', 'certificates_traceability_update', 'certificates_traceability_delete'], 'certificate policies are present');
select policies_are('public', 'assets_certificates', array['assets_certificates_traceability_read', 'assets_certificates_traceability_write'], 'certificate link policies are present');
select policies_are('public', 'transactions', array['transactions_traceability_read'], 'movement read policy is present');
select policies_are('public', 'transaction_details', array['transaction_details_traceability_read'], 'movement detail read policy is present');
select ok((select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'certificates_storage_traceability%') = 4, 'certificate Storage policies are present');
select ok((select with_check::text from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'certificates_storage_traceability_insert') like '%bucket_id = ''certificates''%' and (select with_check::text from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'certificates_storage_traceability_insert') not like '%public.certificates%', 'certificate upload does not require metadata to exist first');
select ok((select with_check::text from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'certificates_storage_traceability_insert') like '%owner = auth.uid()%', 'certificate upload requires authenticated ownership');
select ok((select count(*) from pg_policies where schemaname = 'public' and tablename in ('certificates', 'assets_certificates', 'transactions', 'transaction_details') and (qual::text like '%rbac_request_company_id%' or with_check::text like '%rbac_request_company_id%')) >= 8, 'public policies enforce request-company isolation');
select has_function('public', 'register_bulk_movement', array['jsonb'], 'bulk movement RPC is present');
select has_function('public', 'register_replacement_movement', array['jsonb'], 'replacement movement RPC is present');
select ok(exists (select 1 from pg_constraint where conname = 'assets_certificates_company_id_certificate_id_fkey'), 'certificate link relationship is tenant scoped');
select ok(exists (select 1 from pg_constraint where conname = 'transaction_details_company_id_transaction_id_fkey'), 'movement detail relationship is tenant scoped');
select ok(exists (select 1 from pg_constraint where conname = 'transaction_details_company_id_transaction_id_asset_id_key'), 'movement details prevent duplicate assets');
select ok(has_table_privilege('authenticated', 'public.certificates', 'SELECT'), 'authenticated can reach certificate RLS');
select ok(not exists (select 1 from pg_policies where schemaname = 'public' and tablename in ('transactions', 'transaction_details') and roles::text like '%anon%'), 'anon has no movement RLS policy');
select ok(not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'assets_certificates' and roles::text like '%anon%'), 'anon has no certificate-link RLS policy');

select * from finish();
rollback;
