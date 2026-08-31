begin;
create extension if not exists pgtap with schema extensions;
select plan(24);

select has_type('public', 'transaction_type', 'movement enum exists');
select is(
  (select string_agg(enumlabel, ',' order by enumsortorder) from pg_enum where enumtypid = 'public.transaction_type'::regtype),
  'transfer,reubication,replacement'::text,
  'movement enum labels are canonical'
);
select has_table('public', 'transactions', 'transactions table exists');
select has_table('public', 'transaction_details', 'transaction details table exists');
select has_table('public', 'assets_certificates', 'canonical certificate relation exists');
select col_not_null('public', 'transactions', 'company_id', 'transactions require tenant ownership');
select col_not_null('public', 'transaction_details', 'company_id', 'transaction details require tenant ownership');
select col_not_null('public', 'assets_certificates', 'company_id', 'certificate links require tenant ownership');
select ok(to_regclass('public.certificates') is not null and not exists (
  select 1 from information_schema.columns where table_schema = 'public' and table_name = 'certificates' and column_name = 'asset_id'
), 'certificates do not retain the legacy asset relation');
select ok(exists (select 1 from pg_constraint where conname = 'transaction_details_company_id_transaction_id_fkey'), 'transaction details use composite transaction ownership FK');
select ok(exists (select 1 from pg_constraint where conname = 'assets_certificates_company_id_asset_id_fkey'), 'certificate links use composite asset ownership FK');
select ok(exists (select 1 from pg_constraint where conname = 'assets_certificates_company_id_certificate_id_fkey'), 'certificate links use composite certificate ownership FK');
select ok(exists (select 1 from pg_constraint where conname = 'transaction_details_company_id_transaction_id_asset_id_key'), 'duplicate asset details are protected');
select ok(exists (select 1 from pg_constraint where conname = 'assets_certificates_company_id_asset_id_certificate_id_key'), 'duplicate certificate links are protected');
select ok((select pg_get_constraintdef(oid) like 'FOREIGN KEY (company_id, origin_location_id)%' from pg_constraint where conrelid = 'public.transactions'::regclass and conname like 'transactions_company_id_origin_location_id_fkey'), 'origin location FK is tenant-scoped');
select ok((select pg_get_constraintdef(oid) like 'FOREIGN KEY (company_id, certificate_id)%' from pg_constraint where conrelid = 'public.assets_certificates'::regclass and conname = 'assets_certificates_company_id_certificate_id_fkey'), 'certificate FK fails closed across tenants');
select has_function('public', 'register_bulk_movement', array['jsonb'], 'bulk movement RPC exists');
select has_function('public', 'register_replacement_movement', array['jsonb'], 'replacement movement RPC exists');
select ok((select prosecdef from pg_proc where oid = 'public.register_bulk_movement(jsonb)'::regprocedure), 'bulk movement RPC is security definer');
select ok((select prosecdef from pg_proc where oid = 'public.register_replacement_movement(jsonb)'::regprocedure), 'replacement movement RPC is security definer');
select ok(has_function_privilege('authenticated', 'public.register_bulk_movement(jsonb)', 'EXECUTE'), 'authenticated can execute bulk movement RPC');
select ok(not has_function_privilege('anon', 'public.register_bulk_movement(jsonb)', 'EXECUTE'), 'anon cannot execute bulk movement RPC');
select ok(has_function_privilege('authenticated', 'public.register_replacement_movement(jsonb)', 'EXECUTE'), 'authenticated can execute replacement movement RPC');
select ok(not has_function_privilege('anon', 'public.register_replacement_movement(jsonb)', 'EXECUTE'), 'anon cannot execute replacement movement RPC');

select * from finish();
rollback;
