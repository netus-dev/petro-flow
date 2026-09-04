begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'company_id' and is_nullable = 'YES'), 'profile company membership remains optional');

select ok(
  (select prosecdef from pg_proc where oid = 'public.handle_new_user()'::regprocedure),
  'profile trigger function is SECURITY DEFINER'
);
select ok(
  (select proconfig @> array['search_path=""']::text[]
   from pg_proc where oid = 'public.handle_new_user()'::regprocedure),
  'profile trigger function uses an empty search_path'
);
select ok(
  (select count(*) = 1
   from pg_trigger
   where tgrelid = 'auth.users'::regclass
     and tgname = 'on_auth_user_created'
     and not tgisinternal),
  'auth user profile trigger exists exactly once'
);

insert into auth.users (id, email, raw_user_meta_data)
values ('b1000000-0000-0000-0000-000000000001', 'onboard@example.test', '{"full_name":"Onboard User"}'::jsonb);

select is((select email from public.users where id = 'b1000000-0000-0000-0000-000000000001'), 'onboard@example.test', 'profile copies auth email');
select is((select name from public.users where id = 'b1000000-0000-0000-0000-000000000001'), 'Onboard User', 'profile copies full name metadata');
select ok(exists (select 1 from public.users where id = 'b1000000-0000-0000-0000-000000000001' and email = 'onboard@example.test'), 'new profile has no legacy membership field');
select is((select count(*) from public.rbac_memberships where user_id = 'b1000000-0000-0000-0000-000000000001'), 0::bigint, 'new user receives no RBAC membership');
select is((select count(*) from public.rbac_assignments where user_id = 'b1000000-0000-0000-0000-000000000001'), 0::bigint, 'new user receives no RBAC role assignment');

insert into auth.users (id, email)
values ('a1000000-0000-0000-0000-000000000001', 'edited@example.test')
on conflict (id) do nothing;
insert into public.users (id, email, name)
values ('a1000000-0000-0000-0000-000000000001', 'edited@example.test', 'Edited User')
on conflict (id) do nothing;
select is((select count(*) from public.users where id = 'a1000000-0000-0000-0000-000000000001'), 1::bigint, 'duplicate profile insert is harmless');

select * from finish();
rollback;
