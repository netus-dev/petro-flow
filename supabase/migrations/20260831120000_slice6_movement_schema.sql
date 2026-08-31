-- Slice 6: movement schema only. Legacy certificate ownership is not inferred.

do $$
begin
  if to_regtype('public.transaction_type') is null then
    create type public.transaction_type as enum ('transfer', 'reubication', 'replacement');
  end if;
end
$$;

-- The prior local fixture and policies used certificates.asset_id. The canonical
-- relation is the tenant-scoped assets_certificates join table instead.
drop policy if exists certificates_same_company_read on public.certificates;
drop policy if exists certificates_same_company_write on public.certificates;
drop policy if exists certificates_same_company_update on public.certificates;
drop policy if exists certificates_same_company_delete on public.certificates;

alter table public.certificates add column if not exists company_id uuid;
alter table public.certificates drop constraint if exists certificates_asset_id_fkey;
alter table public.certificates drop column if exists asset_id;
alter table public.certificates drop constraint if exists certificates_company_id_fkey;
alter table public.certificates
  add constraint certificates_company_id_fkey
  foreign key (company_id) references public.rbac_companies(id);
alter table public.certificates
  drop constraint if exists certificates_company_id_id_key;
alter table public.certificates
  add constraint certificates_company_id_id_key unique (company_id, id);

alter table public.ubications
  drop constraint if exists ubications_company_id_id_key;
alter table public.ubications
  add constraint ubications_company_id_id_key unique (company_id, id);

alter table public.assets
  drop constraint if exists assets_company_id_id_key;
alter table public.assets
  add constraint assets_company_id_id_key unique (company_id, id);
alter table public.assets add column if not exists current_ubication_id uuid;
alter table public.assets drop constraint if exists assets_company_id_current_ubication_id_fkey;
alter table public.assets
  add constraint assets_company_id_current_ubication_id_fkey
  foreign key (company_id, current_ubication_id)
    references public.ubications(company_id, id);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  origin_location_id uuid not null,
  destination_location_id uuid,
  origin_ubication_id uuid,
  destination_ubication_id uuid,
  date timestamptz not null,
  type public.transaction_type not null,
  justification text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (company_id) references public.rbac_companies(id),
  foreign key (company_id, origin_location_id)
    references public.locations(company_id, id),
  foreign key (company_id, destination_location_id)
    references public.locations(company_id, id),
  foreign key (company_id, origin_ubication_id)
    references public.ubications(company_id, id),
  foreign key (company_id, destination_ubication_id)
    references public.ubications(company_id, id),
  unique (company_id, id)
);

create table if not exists public.transaction_details (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  transaction_id uuid not null,
  asset_id uuid not null,
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (company_id, transaction_id)
    references public.transactions(company_id, id) on delete cascade,
  foreign key (company_id, asset_id)
    references public.assets(company_id, id),
  unique (company_id, transaction_id, asset_id)
);

create table if not exists public.assets_certificates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  asset_id uuid not null,
  certificate_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (company_id, asset_id) references public.assets(company_id, id) on delete cascade,
  foreign key (company_id, certificate_id)
    references public.certificates(company_id, id) on delete cascade,
  unique (company_id, asset_id, certificate_id)
);

alter table public.transactions enable row level security;
alter table public.transaction_details enable row level security;
alter table public.assets_certificates enable row level security;

create or replace function public.register_bulk_movement(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company_id uuid := public.rbac_request_company_id();
  v_user_id uuid := auth.uid();
  v_transaction_id uuid;
  v_destination_location_id uuid := nullif(p_payload->>'destination_location_id', '')::uuid;
  v_destination_ubication_id uuid := nullif(p_payload->>'destination_ubication_id', '')::uuid;
  v_origin_ubication_id uuid;
  v_asset jsonb;
  v_asset_ids uuid[];
begin
  if v_user_id is null or v_company_id is null
     or not public.rbac_has_capability(v_company_id, 'create', 'movements', 'operations') then
    raise exception 'movement authorization denied' using errcode = '42501';
  end if;
  if jsonb_typeof(p_payload) <> 'object'
     or p_payload->>'type' is null
     or coalesce(p_payload->>'origin_location_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     or (p_payload->>'destination_location_id' is not null and p_payload->>'destination_location_id' <> ''
       and p_payload->>'destination_location_id' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
     or (p_payload->>'destination_ubication_id' is not null and p_payload->>'destination_ubication_id' <> ''
       and p_payload->>'destination_ubication_id' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
     or jsonb_typeof(p_payload->'assets') <> 'array' then
    raise exception 'invalid movement payload' using errcode = '22023';
  end if;
  if p_payload->>'type' not in ('transfer', 'reubication')
     or nullif(p_payload->>'origin_location_id', '') is null
     or nullif(p_payload->>'justification', '') is null
     or jsonb_array_length(coalesce(p_payload->'assets', '[]'::jsonb)) = 0 then
    raise exception 'invalid movement payload' using errcode = '22023';
  end if;
  if p_payload->>'type' = 'reubication' then
    v_destination_location_id := nullif(p_payload->>'origin_location_id', '')::uuid;
  end if;
  if v_destination_ubication_id is null then
    raise exception 'destination ubication is required' using errcode = '22023';
  end if;
  if not exists (select 1 from public.locations where id = (p_payload->>'origin_location_id')::uuid and company_id = v_company_id)
     or not exists (select 1 from public.locations where id = v_destination_location_id and company_id = v_company_id)
     or not exists (select 1 from public.ubications where id = v_destination_ubication_id and company_id = v_company_id and is_active) then
    raise exception 'movement location ownership validation failed' using errcode = '23514';
  end if;
  select array_agg((item->>'asset_id')::uuid) into v_asset_ids
  from jsonb_array_elements(p_payload->'assets') item;
  if exists (select 1 from unnest(v_asset_ids) id where id is null)
     or exists (select 1 from unnest(v_asset_ids) id where not exists (
       select 1 from public.assets a where a.id = id and a.company_id = v_company_id and a.is_active
     )) then
    raise exception 'movement asset ownership validation failed' using errcode = '23514';
  end if;
  select a.current_ubication_id into v_origin_ubication_id
  from public.assets a where a.id = v_asset_ids[1] and a.company_id = v_company_id;
  insert into public.transactions (company_id, origin_location_id, destination_location_id,
    origin_ubication_id, destination_ubication_id, date, type, justification, created_by)
  select v_company_id, (p_payload->>'origin_location_id')::uuid, v_destination_location_id,
    v_origin_ubication_id, v_destination_ubication_id,
    coalesce(nullif(p_payload->>'date', '')::timestamptz, now()), (p_payload->>'type')::public.transaction_type,
    p_payload->>'justification', v_user_id
  returning id into v_transaction_id;
  for v_asset in select * from jsonb_array_elements(p_payload->'assets') loop
    insert into public.transaction_details (company_id, transaction_id, asset_id, comments)
    values (v_company_id, v_transaction_id, (v_asset->>'asset_id')::uuid, nullif(v_asset->>'comments', ''));
  end loop;
  update public.assets set current_location_id = v_destination_location_id,
    current_ubication_id = nullif(p_payload->>'destination_ubication_id', '')::uuid
    where company_id = v_company_id and id = any(v_asset_ids);
  return v_transaction_id;
end;
$$;

create or replace function public.register_replacement_movement(p_payload jsonb)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_company_id uuid := public.rbac_request_company_id();
  v_user_id uuid := auth.uid();
  v_a uuid;
  v_b uuid;
  v_b_dest uuid;
  v_a_old uuid; v_b_old uuid;
  v_tx uuid;
begin
  if v_user_id is null or v_company_id is null or not public.rbac_has_capability(v_company_id, 'create', 'movements', 'operations') then raise exception 'movement authorization denied' using errcode = '42501'; end if;
  if jsonb_typeof(p_payload) <> 'object'
     or p_payload->>'type' <> 'replacement'
     or nullif(p_payload->>'justification', '') is null
     or coalesce(p_payload->>'location_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     or coalesce(p_payload->>'asset_a_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     or coalesce(p_payload->>'asset_b_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     or coalesce(p_payload->>'asset_b_destination_ubication_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    raise exception 'invalid replacement movement payload' using errcode = '22023';
  end if;
  v_a := (p_payload->>'asset_a_id')::uuid;
  v_b := (p_payload->>'asset_b_id')::uuid;
  v_b_dest := (p_payload->>'asset_b_destination_ubication_id')::uuid;
  if v_a = v_b then
    raise exception 'replacement requires two distinct assets' using errcode = '22023';
  end if;
  select a.current_ubication_id, b.current_ubication_id into v_a_old, v_b_old from public.assets a join public.assets b on b.company_id = a.company_id where a.id = v_a and b.id = v_b and a.company_id = v_company_id and a.is_active and b.is_active;
  if v_a_old is null or v_b_old is null or not exists (select 1 from public.locations where id = (p_payload->>'location_id')::uuid and company_id = v_company_id) or not exists (select 1 from public.ubications where id = v_b_dest and company_id = v_company_id and is_active) then raise exception 'replacement ownership validation failed' using errcode = '23514'; end if;
  insert into public.transactions (company_id, origin_location_id, destination_location_id, origin_ubication_id, destination_ubication_id, date, type, justification, created_by)
  values (v_company_id, (p_payload->>'location_id')::uuid, (p_payload->>'location_id')::uuid, v_a_old, v_b_old, now(), 'replacement', p_payload->>'justification', v_user_id) returning id into v_tx;
  insert into public.transaction_details (company_id, transaction_id, asset_id) values (v_company_id, v_tx, v_a);
  insert into public.transactions (company_id, origin_location_id, destination_location_id, origin_ubication_id, destination_ubication_id, date, type, justification, created_by)
  values (v_company_id, (p_payload->>'location_id')::uuid, (p_payload->>'location_id')::uuid, v_b_old, v_b_dest, now(), 'replacement', p_payload->>'justification', v_user_id) returning id into v_tx;
  insert into public.transaction_details (company_id, transaction_id, asset_id) values (v_company_id, v_tx, v_b);
  update public.assets set current_ubication_id = v_b_old where company_id = v_company_id and id = v_a;
  update public.assets set current_ubication_id = v_b_dest where company_id = v_company_id and id = v_b;
end; $$;

revoke all on function public.register_bulk_movement(jsonb) from public;
revoke all on function public.register_replacement_movement(jsonb) from public;
revoke execute on function public.register_bulk_movement(jsonb) from anon;
revoke execute on function public.register_replacement_movement(jsonb) from anon;
grant execute on function public.register_bulk_movement(jsonb) to authenticated;
grant execute on function public.register_replacement_movement(jsonb) to authenticated;
