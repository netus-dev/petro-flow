-- Local-only compatibility fixture. This reproduces the verified legacy shape
-- and intentionally broad authenticated policy baseline; do not deploy this
-- migration to a remote environment.

create table public.companies (
  id uuid primary key,
  name text,
  description text,
  created_at timestamptz not null default now(),
  is_active boolean not null default true
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  job_position text,
  phone text,
  image_url text,
  is_active boolean,
  created_at timestamptz not null default now(),
  company_id uuid not null references public.companies(id) on delete cascade
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_custom boolean default true,
  company_id uuid not null references public.companies(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default gen_random_uuid() references public.companies(id) on delete cascade,
  name text not null unique,
  is_custom boolean default true,
  created_at timestamptz not null default now(),
  unique (id)
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default gen_random_uuid() references public.users(id) on delete cascade,
  role_id uuid default gen_random_uuid() references public.roles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid default gen_random_uuid() references public.roles(id) on delete cascade,
  permission_id uuid default gen_random_uuid() references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.locations (
  id uuid primary key,
  name text not null,
  location_type text not null
);

create table public.functional_principles (
  id uuid primary key,
  name text not null
);

create table public.assets (
  id uuid primary key,
  current_location_id uuid not null references public.locations(id),
  function_principle_id uuid not null references public.functional_principles(id),
  is_active boolean not null default true
);

create table public.certificates (
  id uuid primary key,
  asset_id uuid not null references public.assets(id),
  storage_path text not null unique,
  uploaded_by uuid not null
);

create function public.get_asset_stats_by_functional_principle(p_function_principle_id uuid)
returns table(location_name text, location_type text, total_assets bigint)
language plpgsql volatile security definer set search_path = '' as $$
begin
  return query
    select l.name, l.location_type, count(*)::bigint
    from public.assets a
    join public.locations l on l.id = a.current_location_id
    where a.function_principle_id = p_function_principle_id
      and a.is_active = true
    group by l.name, l.location_type
    order by count(*) desc;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['companies', 'users', 'roles', 'permissions', 'user_roles', 'role_permissions'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy legacy_%I_authenticated_crud on public.%I for all to authenticated using (true) with check (true)', table_name, table_name);
  end loop;
end
$$;

insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', false)
on conflict (id) do update set public = excluded.public;

create policy legacy_certificates_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'certificates');
create policy legacy_certificates_select on storage.objects for select to authenticated
  using (bucket_id = 'certificates');
create policy legacy_certificates_update on storage.objects for update to authenticated
  using (bucket_id = 'certificates') with check (bucket_id = 'certificates');

insert into public.locations (id, name, location_type) values
  ('30000000-0000-0000-0000-000000000001', 'Base Norte', 'base'),
  ('30000000-0000-0000-0000-000000000002', 'Pozo Alfa', 'rig');
insert into public.functional_principles (id, name) values
  ('40000000-0000-0000-0000-000000000001', 'Tubular');
insert into public.assets (id, current_location_id, function_principle_id, is_active) values
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', true),
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', true),
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', false);
insert into public.certificates (id, asset_id, storage_path, uploaded_by) values
  ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002');
insert into storage.objects (id, bucket_id, name, owner, metadata) values
  ('70000000-0000-0000-0000-000000000001', 'certificates', '60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '{"mimetype":"application/pdf"}'::jsonb),
  ('70000000-0000-0000-0000-000000000002', 'certificates', '60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '{"mimetype":"image/png"}'::jsonb);

comment on table public.certificates is
  'Local sanitized fixture. Equality of uploaded_by/owner and storage_path/name is an inferred contract from all observed remote rows, not a universal guarantee.';

grant select on public.certificates to authenticated;
