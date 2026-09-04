-- Reusable operational scope. It is intentionally separate from RBAC memberships.
create table if not exists public.rbac_operational_scopes (
  company_id uuid not null references public.rbac_companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  all_rigs boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (company_id, user_id)
);
create table if not exists public.rbac_operational_scope_rigs (
  company_id uuid not null,
  user_id uuid not null,
  rig_id uuid not null,
  primary key (company_id, user_id, rig_id),
  foreign key (company_id, user_id) references public.rbac_operational_scopes(company_id, user_id) on delete cascade,
  foreign key (rig_id) references public.rigs(id) on delete cascade
);
alter table public.rbac_operational_scopes enable row level security;
alter table public.rbac_operational_scope_rigs enable row level security;
revoke all on public.rbac_operational_scopes, public.rbac_operational_scope_rigs from anon, authenticated;
grant select on public.rbac_operational_scopes, public.rbac_operational_scope_rigs to authenticated;

create or replace function public.rbac_operational_scope_admin_allowed(p_company_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.rbac_memberships m
    join public.rbac_assignments a on a.company_id=m.company_id and a.user_id=m.user_id
    join public.rbac_roles r on r.id=a.role_id
    where m.company_id=p_company_id and m.user_id=auth.uid() and m.is_active and r.name='developer'
  )
$$;

create or replace function public.rbac_operational_rig_allowed(p_company_id uuid, p_rig_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.locations l where l.id=p_rig_id and l.company_id=p_company_id and l.type::text='rig' and l.is_active
    and exists (select 1 from public.rbac_operational_scopes s where s.company_id=p_company_id and s.user_id=auth.uid()
      and (s.all_rigs or exists (select 1 from public.rbac_operational_scope_rigs r where r.company_id=s.company_id and r.user_id=s.user_id and r.rig_id=l.id))))
$$;
revoke all on function public.rbac_operational_rig_allowed(uuid,uuid) from public;
grant execute on function public.rbac_operational_rig_allowed(uuid,uuid) to authenticated;

create or replace function public.rbac_admin_allowed() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.rbac_memberships m join public.rbac_assignments a using (company_id,user_id)
    join public.rbac_roles r on r.id=a.role_id where m.company_id=public.rbac_request_company_id()
    and m.user_id=auth.uid() and m.is_active and r.name='developer')
$$;


create or replace function public.rbac_user_rig_scope(p_company_id uuid default null)
returns jsonb language sql stable security definer set search_path = '' as $$
  with c as (select coalesce(p_company_id, public.rbac_request_company_id()) as company_id),
  s as (select os.* from public.rbac_operational_scopes os, c where os.company_id=c.company_id and os.user_id=auth.uid()),
  rigs as (
    select l.id, l.name from public.locations l, c where l.company_id=c.company_id and l.type::text='rig' and l.is_active
      and exists (select 1 from s where s.all_rigs or exists (select 1 from public.rbac_operational_scope_rigs x where x.company_id=s.company_id and x.user_id=s.user_id and x.rig_id=l.id))
  )
  select jsonb_build_object('assigned', exists(select 1 from s), 'allRigs', coalesce((select all_rigs from s), false),
    'rigs', coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name) order by name,id) from rigs), '[]'::jsonb))
$$;
revoke all on function public.rbac_user_rig_scope(uuid) from public;
grant execute on function public.rbac_user_rig_scope(uuid) to authenticated;

-- Initial local fixture: add only missing Rig 702/703 locations and scope hola.
do $$ declare c uuid; u uuid; l uuid; n text; begin
  select id into u from auth.users where email='hola@oalonsodev.com';
  select company_id into c from public.rbac_memberships where user_id=u and is_active order by company_id limit 1;
  if c is not null then
    insert into public.rbac_operational_scopes(company_id,user_id) values(c,u) on conflict do nothing;
    foreach n in array array['Rig 702','Rig 703'] loop
      select id into l from public.locations where company_id=c and type::text='rig' and name=n limit 1;
      if l is null then
        insert into public.locations(id,name,type,company_id,is_active) values(gen_random_uuid(),n,'rig'::public.location_type,c,true) returning id into l;
        insert into public.rigs(id) values(l);
      end if;
      insert into public.rbac_operational_scope_rigs(company_id,user_id,rig_id) values(c,u,l) on conflict do nothing;
    end loop;
  end if;
end $$;

drop policy if exists operational_scope_admin_read on public.rbac_operational_scopes;
create policy operational_scope_admin_read on public.rbac_operational_scopes for select to authenticated using (public.rbac_operational_scope_admin_allowed(company_id));
drop policy if exists operational_scope_rigs_admin_read on public.rbac_operational_scope_rigs;
create policy operational_scope_rigs_admin_read on public.rbac_operational_scope_rigs for select to authenticated using (public.rbac_operational_scope_admin_allowed(company_id));

drop policy if exists hourmeters_history_select on public.asset_operational_parameters_history;
create policy hourmeters_history_select on public.asset_operational_parameters_history for select to authenticated using (company_id=public.rbac_request_company_id() and public.rbac_has_capability(company_id,'read','hour-meters','hour-meters') and exists (select 1 from public.assets a where a.id=asset_id and public.rbac_operational_rig_allowed(company_id,a.current_location_id)));
drop policy if exists assets_same_company_read on public.assets;
create policy assets_same_company_read on public.assets for select to authenticated using (company_id=public.rbac_request_company_id() and (public.rbac_has_capability(company_id,'read','assets','operations') or (public.rbac_has_capability(company_id,'read','hour-meters','hour-meters') and public.rbac_operational_rig_allowed(company_id,current_location_id))));
drop policy if exists hourmeters_history_insert on public.asset_operational_parameters_history;
create policy hourmeters_history_insert on public.asset_operational_parameters_history for insert to authenticated with check (company_id=public.rbac_request_company_id() and public.rbac_has_capability(company_id,'register','hour-meters','hour-meters') and created_by=auth.uid() and exists (select 1 from public.assets a where a.id=asset_operational_parameters_history.asset_id and a.company_id=asset_operational_parameters_history.company_id and a.is_active and public.rbac_operational_rig_allowed(asset_operational_parameters_history.company_id,a.current_location_id)));
