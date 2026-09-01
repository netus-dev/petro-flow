-- Recover remote operational columns and tables without removing the local RBAC boundary.

do $$
begin
  if not exists (select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'asset_status') then
    create type public.asset_status as enum ('active', 'under_inspection', 'rejected');
  end if;
  if not exists (select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'location_type') then
    create type public.location_type as enum ('rig', 'operating_base');
  end if;
  if not exists (select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'task_status') then
    create type public.task_status as enum ('pending', 'completed', 'in_progress');
  end if;
end
$$;

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'locations' and column_name = 'location_type')
     and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'locations' and column_name = 'type') then
    alter table public.locations rename column location_type to type;
  end if;
end
$$;
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'locations' and column_name = 'type' and udt_name = 'text') then
    alter table public.locations alter column type type public.location_type using
      (case when type = 'base' then 'operating_base' else type end)::public.location_type;
  end if;
end
$$;
alter table public.locations add column if not exists is_active boolean not null default true;
alter table public.locations add column if not exists created_at timestamptz not null default now();
alter table public.locations add column if not exists updated_at timestamptz not null default now();

alter table public.assets add column if not exists brand_id uuid;
alter table public.assets add column if not exists model_id uuid;
alter table public.assets add column if not exists capacity varchar(100);
alter table public.assets add column if not exists serial_number varchar(100);
alter table public.assets add column if not exists last_inspection_code varchar(100);
alter table public.assets add column if not exists status public.asset_status;
alter table public.assets add column if not exists property_1 varchar(255);
alter table public.assets add column if not exists property_2 varchar(255);
alter table public.assets add column if not exists property_3 varchar(255);
alter table public.assets add column if not exists property_4 varchar(255);
alter table public.assets add column if not exists property_5 varchar(255);
alter table public.assets add column if not exists property_6 varchar(255);
alter table public.assets add column if not exists property_7 varchar(255);
alter table public.assets add column if not exists property_8 varchar(255);
alter table public.assets add column if not exists property_9 varchar(255);
alter table public.assets add column if not exists property_10 varchar(255);
alter table public.assets add column if not exists property_11 integer;
alter table public.assets add column if not exists property_12 integer;
alter table public.assets add column if not exists property_13 integer;
alter table public.assets add column if not exists property_14 integer;
alter table public.assets add column if not exists property_15 integer;
alter table public.assets add column if not exists property_16 double precision;
alter table public.assets add column if not exists property_17 double precision;
alter table public.assets add column if not exists property_18 double precision;
alter table public.assets add column if not exists property_19 double precision;
alter table public.assets add column if not exists property_20 double precision;
alter table public.assets add column if not exists created_at timestamptz not null default now();
alter table public.assets add column if not exists updated_at timestamptz not null default now();
update public.assets set status = 'active' where status is null;
alter table public.assets alter column status set default 'active';
alter table public.assets alter column status set not null;

alter table public.functional_principles add column if not exists property_1 varchar(255);
alter table public.functional_principles add column if not exists property_2 varchar(255);
alter table public.functional_principles add column if not exists property_3 varchar(255);
alter table public.functional_principles add column if not exists property_4 varchar(255);
alter table public.functional_principles add column if not exists property_5 varchar(255);
alter table public.functional_principles add column if not exists property_6 varchar(255);
alter table public.functional_principles add column if not exists property_7 varchar(255);
alter table public.functional_principles add column if not exists property_8 varchar(255);
alter table public.functional_principles add column if not exists property_9 varchar(255);
alter table public.functional_principles add column if not exists property_10 varchar(255);
alter table public.functional_principles add column if not exists property_11 varchar(255);
alter table public.functional_principles add column if not exists property_12 varchar(255);
alter table public.functional_principles add column if not exists property_13 varchar(255);
alter table public.functional_principles add column if not exists property_14 varchar(255);
alter table public.functional_principles add column if not exists property_15 varchar(255);
alter table public.functional_principles add column if not exists property_16 varchar(255);
alter table public.functional_principles add column if not exists property_17 varchar(255);
alter table public.functional_principles add column if not exists property_18 varchar(255);
alter table public.functional_principles add column if not exists property_19 varchar(255);
alter table public.functional_principles add column if not exists property_20 varchar(255);
alter table public.functional_principles add column if not exists created_at timestamptz not null default now();
alter table public.functional_principles add column if not exists updated_at timestamptz not null default now();
alter table public.functional_principles add column if not exists is_active boolean not null default true;
alter table public.functional_principles add column if not exists scope_id uuid;

alter table public.certificates add column if not exists file_name text;
alter table public.certificates add column if not exists mime_type text;
alter table public.certificates add column if not exists uploaded_at timestamptz not null default now();

create table if not exists public.functional_principle_scopes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  company_id uuid not null references public.rbac_companies(id) on delete restrict
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  comments text,
  previous_task_id uuid references public.tasks(id) on delete restrict,
  next_task_id uuid references public.tasks(id) on delete restrict,
  created_by uuid not null references public.users(id) on delete restrict,
  rig_id uuid not null references public.rigs(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_active boolean not null default true,
  status public.task_status not null default 'pending'
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'functional_principles_scope_id_fkey') then
    alter table public.functional_principles add constraint functional_principles_scope_id_fkey
      foreign key (scope_id) references public.functional_principle_scopes(id) on delete restrict;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'assets_brand_id_fkey') then
    alter table public.assets add constraint assets_brand_id_fkey foreign key (brand_id) references public.brands(id) on delete restrict;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'assets_model_id_fkey') then
    alter table public.assets add constraint assets_model_id_fkey foreign key (model_id) references public.models(id) on delete restrict;
  end if;
end
$$;

create index if not exists assets_brand_id_idx on public.assets(brand_id);
create index if not exists assets_model_id_idx on public.assets(model_id);
create index if not exists assets_status_idx on public.assets(status);
create index if not exists functional_principles_scope_id_idx on public.functional_principles(scope_id);
create index if not exists tasks_created_by_idx on public.tasks(created_by);
create index if not exists tasks_rig_idx on public.tasks(rig_id);
create index if not exists tasks_start_date_idx on public.tasks(start_date);

create or replace function public.get_asset_stats_by_functional_principle(p_function_principle_id uuid)
returns table(location_name text, location_type text, total_assets bigint)
language sql stable security definer set search_path = '' as $$
  select l.name, l.type::text, count(*)::bigint
  from public.assets a
  join public.locations l on l.id = a.current_location_id
  where a.function_principle_id = p_function_principle_id and a.is_active
  group by l.name, l.type
  order by count(*) desc
$$;

alter table public.functional_principle_scopes enable row level security;
alter table public.tasks enable row level security;

drop policy if exists functional_principle_scopes_read on public.functional_principle_scopes;
create policy functional_principle_scopes_read on public.functional_principle_scopes
  for select to authenticated using (company_id = public.rbac_request_company_id() and public.rbac_can_read_catalog(company_id));
drop policy if exists tasks_read on public.tasks;
create policy tasks_read on public.tasks for select to authenticated using (
  exists (select 1 from public.locations l where l.id = tasks.rig_id and l.company_id = public.rbac_request_company_id())
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();
