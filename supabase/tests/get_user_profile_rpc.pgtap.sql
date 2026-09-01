begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

select ok(
  (select prosecdef from pg_proc where oid = 'public.get_user_profile(uuid)'::regprocedure),
  'profile RPC is SECURITY DEFINER'
);
select ok(
  (select proconfig @> array['search_path=""']::text[]
   from pg_proc where oid = 'public.get_user_profile(uuid)'::regprocedure),
  'profile RPC uses an empty search_path'
);
select ok(
  has_function_privilege('authenticated', 'public.get_user_profile(uuid)', 'EXECUTE'),
  'authenticated can execute the profile RPC'
);
select ok(
  not has_function_privilege('anon', 'public.get_user_profile(uuid)', 'EXECUTE'),
  'anon cannot execute the profile RPC'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000000', true);
select is(
  public.get_user_profile('00000000-0000-0000-0000-000000000000'::uuid) ?& array['profile', 'company', 'roles', 'permissions'],
  true,
  'profile RPC returns the expected JSON keys'
);
select is(
  jsonb_typeof(public.get_user_profile('00000000-0000-0000-0000-000000000000'::uuid)->'roles'),
  'array',
  'profile RPC returns roles as an array'
);
select is(
  jsonb_typeof(public.get_user_profile('00000000-0000-0000-0000-000000000000'::uuid)->'permissions'),
  'array',
  'profile RPC returns permissions as an array'
);

select * from finish();
rollback;
