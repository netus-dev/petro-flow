begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

select ok(to_regclass('public.companies') is null, 'legacy companies table is retired after seed cutover');
select ok(to_regclass('public.rbac_companies') is not null, 'canonical rbac_companies is preserved');
select is((select count(*) from public.rbac_companies where id in
  ('a2000000-0000-0000-0000-000000000001'::uuid, 'a2000000-0000-0000-0000-000000000002'::uuid)), 2::bigint,
  'canonical company identities remain intact');
select is((select count(*) from pg_constraint c join pg_class p on p.oid = c.confrelid
  where p.relname = 'companies'), 0::bigint, 'no foreign key references the retired table');
select is((select count(*) from pg_class v
  where v.relkind = 'v' and pg_get_viewdef(v.oid, true) ~* '(^|[^a-z_])((public\.)?companies)([^a-z_]|$)'), 0::bigint,
  'no view definition references the retired table');
select is((select count(*) from pg_proc
  where oid <> 'public.rbac_rehearse_retire_companies()'::regprocedure
    and prosrc ~* '(^|[^a-z_])((public\.)?companies)([^a-z_]|$)'), 0::bigint,
  'no function source references the retired table');
select is((select count(*) from pg_policies where schemaname = 'public' and tablename = 'companies'), 0::bigint,
  'no policy remains for the retired table');
select is((select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid where c.relname = 'companies' and not t.tgisinternal), 0::bigint,
  'no trigger remains for the retired table');

select * from finish();
rollback;
