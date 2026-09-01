-- Hourmeters persistence is tenant-owned and remains safe to rerun.
create table if not exists public.hourmeters_settings (
  company_id uuid primary key references public.rbac_companies(id) on delete cascade,
  eligible_functional_principles text[] not null default array[
    'Motor de Combustión Interna', 'Bomba de Lodo', 'Malacate', 'Top Drive',
    'Bomba para Operar Preventores', 'Unidad de Potencia Hidráulica'
  ],
  updated_at timestamptz not null default now()
);

create table if not exists public.asset_operational_parameters_history (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.rbac_companies(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  hours numeric,
  diesel_accumulated_gallons numeric,
  mw_accumulated numeric,
  mvar_accumulated numeric,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid not null default auth.uid() references auth.users(id),
  check (hours is null or hours >= 0),
  check (diesel_accumulated_gallons is null or diesel_accumulated_gallons >= 0),
  check (mw_accumulated is null or mw_accumulated >= 0),
  check (mvar_accumulated is null or mvar_accumulated >= 0)
);

insert into public.hourmeters_settings (company_id)
select id from public.rbac_companies
on conflict (company_id) do nothing;

alter table public.asset_operational_parameters_history
  drop constraint if exists asset_history_asset_same_company_fkey;
alter table public.asset_operational_parameters_history
  add constraint asset_history_asset_same_company_fkey
  foreign key (company_id, asset_id) references public.assets(company_id, id);

create index if not exists asset_history_asset_captured_idx
  on public.asset_operational_parameters_history(asset_id, captured_at desc);

create or replace function public.reject_hourmeter_history_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'hourmeter history is append-only' using errcode = '42501';
end
$$;
drop trigger if exists asset_history_append_only on public.asset_operational_parameters_history;
create trigger asset_history_append_only
before update or delete on public.asset_operational_parameters_history
for each row execute function public.reject_hourmeter_history_mutation();

alter table public.hourmeters_settings enable row level security;
alter table public.asset_operational_parameters_history enable row level security;
revoke all on public.hourmeters_settings, public.asset_operational_parameters_history from anon, authenticated;
grant select, update on public.hourmeters_settings to authenticated;
grant select, insert on public.asset_operational_parameters_history to authenticated;

drop policy if exists hourmeters_settings_read on public.hourmeters_settings;
create policy hourmeters_settings_read on public.hourmeters_settings for select to authenticated
using (company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'read', 'hourmeters', 'operations'));
drop policy if exists hourmeters_settings_manage on public.hourmeters_settings;
create policy hourmeters_settings_manage on public.hourmeters_settings for update to authenticated
using (company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'update', 'hourmeters', 'operations'))
with check (company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'update', 'hourmeters', 'operations'));
drop policy if exists hourmeters_settings_insert on public.hourmeters_settings;
create policy hourmeters_settings_insert on public.hourmeters_settings for insert to authenticated
with check (company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'update', 'hourmeters', 'operations'));

drop policy if exists hourmeters_history_select on public.asset_operational_parameters_history;
create policy hourmeters_history_select on public.asset_operational_parameters_history for select to authenticated
using (company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'read', 'hourmeters', 'operations'));
drop policy if exists hourmeters_history_insert on public.asset_operational_parameters_history;
create policy hourmeters_history_insert on public.asset_operational_parameters_history for insert to authenticated
with check (company_id = public.rbac_request_company_id()
  and public.rbac_has_capability(company_id, 'register', 'hourmeters', 'operations')
  and created_by = auth.uid()
  and exists (select 1 from public.assets a
    join public.functional_principles fp on fp.id = a.function_principle_id
    join public.hourmeters_settings s on s.company_id = a.company_id
    where a.id = asset_operational_parameters_history.asset_id
      and a.company_id = asset_operational_parameters_history.company_id and a.is_active
      and fp.company_id = a.company_id and fp.name = any(s.eligible_functional_principles)));
