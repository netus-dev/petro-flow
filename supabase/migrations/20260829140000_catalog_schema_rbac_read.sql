-- Catalog read slice reconciled only from docs/supabase_csv/*.csv.
-- No columns from the unresolved transactions/user_roles ordinal gaps are used.

-- The local legacy fixture predates company ownership on these catalog tables.
-- Keep existing rows readable only after explicit ownership reconciliation.
alter table public.locations add column if not exists company_id uuid;
alter table public.functional_principles add column if not exists company_id uuid;

create table if not exists public.ubications (
  id uuid primary key default gen_random_uuid(),
  name varchar(50) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  company_id uuid not null references public.companies(id) on delete cascade,
  is_active boolean not null default true,
  allow_multi_assets boolean not null default false
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true,
  company_id uuid not null references public.companies(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.models (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand_id uuid not null references public.brands(id) on delete cascade,
  is_active boolean not null default true,
  company_id uuid not null references public.companies(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name varchar(50) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  company_id uuid not null references public.companies(id) on delete cascade
);

create table if not exists public.wells (
  id uuid primary key default gen_random_uuid(),
  name varchar(50) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  company_id uuid not null references public.companies(id) on delete cascade
);

create table if not exists public.operating_bases (
  id uuid primary key references public.locations(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rigs (
  id uuid primary key references public.locations(id) on delete cascade,
  current_well_id uuid references public.wells(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists models_brand_id_idx on public.models(brand_id);
create index if not exists operating_bases_supplier_id_idx on public.operating_bases(supplier_id);
create index if not exists rigs_current_well_id_idx on public.rigs(current_well_id);

alter table public.brands enable row level security;
alter table public.models enable row level security;
alter table public.suppliers enable row level security;
alter table public.wells enable row level security;
alter table public.operating_bases enable row level security;
alter table public.rigs enable row level security;

create or replace function public.rbac_can_read_catalog(p_company_id uuid)
returns boolean
language sql stable security definer set search_path = '' as $$
  select public.rbac_renew_authorization(p_company_id)
    and public.rbac_has_capability(p_company_id, 'read', 'catalogs', 'operations')
$$;

create policy catalog_brands_read on public.brands for select to authenticated using (
  company_id = public.rbac_request_company_id() and public.rbac_can_read_catalog(company_id)
);
create policy catalog_models_read on public.models for select to authenticated using (
  company_id = public.rbac_request_company_id() and public.rbac_can_read_catalog(company_id)
);
create policy catalog_suppliers_read on public.suppliers for select to authenticated using (
  company_id = public.rbac_request_company_id() and public.rbac_can_read_catalog(company_id)
);
create policy catalog_wells_read on public.wells for select to authenticated using (
  company_id = public.rbac_request_company_id() and public.rbac_can_read_catalog(company_id)
);
create policy catalog_operating_bases_read on public.operating_bases for select to authenticated using (
  exists (
    select 1 from public.locations l
    where l.id = operating_bases.id
      and (select l2.company_id from public.locations l2 where l2.id = operating_bases.id) = public.rbac_request_company_id()
      and public.rbac_can_read_catalog((select l2.company_id from public.locations l2 where l2.id = operating_bases.id))
  )
);
create policy catalog_rigs_read on public.rigs for select to authenticated using (
  exists (
    select 1 from public.locations l
    where l.id = rigs.id
      and (select l2.company_id from public.locations l2 where l2.id = rigs.id) = public.rbac_request_company_id()
      and public.rbac_can_read_catalog((select l2.company_id from public.locations l2 where l2.id = rigs.id))
  )
);

do $$
begin
  execute 'drop policy if exists legacy_locations_authenticated_crud on public.locations';
  execute 'drop policy if exists legacy_ubications_authenticated_crud on public.ubications';
  execute 'drop policy if exists legacy_functional_principles_authenticated_crud on public.functional_principles';
end
$$;

create policy catalog_locations_read on public.locations for select to authenticated using (
  company_id = public.rbac_request_company_id() and public.rbac_can_read_catalog(company_id)
);
create policy catalog_ubications_read on public.ubications for select to authenticated using (
  company_id = public.rbac_request_company_id() and public.rbac_can_read_catalog(company_id)
);
create policy catalog_functional_principles_read on public.functional_principles for select to authenticated using (
  company_id = public.rbac_request_company_id() and public.rbac_can_read_catalog(company_id)
);

revoke all on function public.rbac_can_read_catalog(uuid) from public;
grant execute on function public.rbac_can_read_catalog(uuid) to authenticated;
