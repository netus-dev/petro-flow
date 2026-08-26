-- P0 RBAC compatibility preparation.
--
-- This migration deliberately does not copy, rename, update, or drop legacy
-- data. The local schema currently has no legacy tables, and their column
-- contracts are not available in this repository. Conditional views provide
-- a reversible bridge without creating a second identity source of truth.
create schema if not exists rbac_compat;

comment on schema rbac_compat is
  'Read-only compatibility views for legacy RBAC tables; no data ownership.';

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'companies', 'users', 'roles', 'permissions', 'user_roles', 'role_permissions'
  ] loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format(
        'create or replace view rbac_compat.%I as select * from public.%I',
        table_name, table_name
      );
      execute format(
        'comment on view rbac_compat.%I is %L',
        table_name,
        'Read-only bridge to public.' || table_name || '; legacy table remains authoritative.'
      );
    end if;
  end loop;
end
$$;

-- The local authorization projection is the only known SECURITY DEFINER
-- compatibility-sensitive function. Keep name resolution independent of the
-- caller and do not assume any legacy function signature.
do $$
begin
  if to_regprocedure('public.authorization_projection(uuid)') is not null then
    alter function public.authorization_projection(uuid) set search_path = '';
  end if;
end
$$;

-- Intentionally skipped until local legacy DDL and storage policies exist:
-- * RLS/policy changes could deny existing callers or expose unknown columns.
-- * storage.objects ownership/path rules require the bucket and path contract.
-- * identity/role mapping requires verified primary and foreign key columns.
-- The compatibility views above are read-only and can be removed independently.
