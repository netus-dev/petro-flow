-- Canonical operational tables. Tenant ownership is stored on operational rows
-- and canonical rbac_* tables, never on the Auth profile in public.users.
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location_type text not null,
  company_id uuid,
  is_active boolean not null default true
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  job_position text,
  phone text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.functional_principles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_id uuid
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  current_location_id uuid not null references public.locations(id),
  function_principle_id uuid not null references public.functional_principles(id),
  is_active boolean not null default true,
  status text
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid,
  storage_path text not null unique,
  uploaded_by uuid not null
);

-- The clean production chain starts from an empty database after the approved
-- destructive reset; these definitions are intentionally not compatibility DDL.
alter table public.locations add column if not exists company_id uuid;
alter table public.locations add column if not exists is_active boolean not null default true;
alter table public.users add column if not exists name text;
alter table public.users add column if not exists email text;
alter table public.users add column if not exists job_position text;
alter table public.users add column if not exists phone text;
alter table public.users add column if not exists image_url text;
alter table public.users add column if not exists is_active boolean not null default true;
alter table public.users add column if not exists created_at timestamptz not null default now();
alter table public.functional_principles add column if not exists company_id uuid;
alter table public.assets add column if not exists is_active boolean not null default true;
alter table public.assets add column if not exists status text;
alter table public.certificates add column if not exists asset_id uuid;
alter table public.certificates add column if not exists uploaded_by uuid;

-- Keep the baseline RPC available to later grants/revokes. Resolve the
-- location column at execution time because April versions used both names.
create or replace function public.get_asset_stats_by_functional_principle(fp_id uuid)
returns table(location_name text, location_type text, total_assets bigint)
language plpgsql security definer set search_path = '' as $$
declare
  location_column text;
begin
  select case
    when exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'locations'
                   and column_name = 'type') then 'type'
    when exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'locations'
                   and column_name = 'location_type') then 'location_type'
  end into location_column;

  if location_column is null then
    raise exception 'public.locations has no location type column';
  end if;

  return query execute format(
    'select l.name, l.%I::text, count(*)::bigint
       from public.assets a
       join public.locations l on l.id = a.current_location_id
      where a.function_principle_id = $1 and a.is_active
      group by l.name, l.%I
      order by count(*) desc', location_column, location_column
  ) using fp_id;
end;
$$;

-- Auth profile creation is owned by 20260826150000 to avoid duplicate triggers.
