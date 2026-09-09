-- Tables and functions created after the initial web-surface hardening must
-- retain the same closed anon baseline.
do $$
declare object_name text;
begin
  for object_name in
    select format('%I.%I', n.nspname, c.relname)
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p')
  loop
    execute format('revoke all on table %s from anon', object_name);
  end loop;
  for object_name in
    select format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid))
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  loop
    execute format('revoke all on function %s from public, anon', object_name);
  end loop;
end
$$;
