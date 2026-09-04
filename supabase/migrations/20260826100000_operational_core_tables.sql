-- Canonical operational tables. Disposable legacy compatibility objects live in
-- supabase/rehearsal and are not part of this production schema.
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location_type text not null,
  company_id uuid,
  is_active boolean not null default true
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  job_position text,
  phone text,
  image_url text,
  company_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.functional_principles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_id uuid
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  current_location_id uuid not null references public.locations(id),
  function_principle_id uuid not null references public.functional_principles(id),
  is_active boolean not null default true,
  status text
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid,
  storage_path text not null unique,
  uploaded_by uuid not null
);

create function public.get_asset_stats_by_functional_principle(p_function_principle_id uuid)
returns table(location_name text, location_type text, total_assets bigint)
language sql security definer set search_path = '' as $$
  select l.name, l.location_type, count(*)::bigint
  from public.assets a
  join public.locations l on l.id = a.current_location_id
  where a.function_principle_id = p_function_principle_id and a.is_active
  group by l.name, l.location_type
  order by count(*) desc
$$;

create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.users (id, email, name)
  values (new.id, coalesce(new.email, ''), coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'New User'))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();
