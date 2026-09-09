create table if not exists public.hourmeter_maintenance_thresholds (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.rbac_companies(id) on delete cascade,
  functional_principle_id uuid not null,
  threshold_hours integer not null check (threshold_hours > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hourmeter_threshold_company_principle_fk foreign key (company_id, functional_principle_id)
    references public.functional_principles(company_id, id) on delete cascade,
  constraint hourmeter_threshold_unique unique (company_id, functional_principle_id, threshold_hours)
);
create index if not exists hourmeter_threshold_lookup on public.hourmeter_maintenance_thresholds(company_id, functional_principle_id, threshold_hours);
alter table public.hourmeter_maintenance_thresholds enable row level security;
revoke all on public.hourmeter_maintenance_thresholds from anon, authenticated;
grant select, insert, update, delete on public.hourmeter_maintenance_thresholds to authenticated;
create policy hourmeter_threshold_read on public.hourmeter_maintenance_thresholds for select to authenticated using (
  company_id = public.rbac_request_company_id() and public.rbac_has_capability(company_id, 'read', 'hour-meters', 'hour-meters')
);
create policy hourmeter_threshold_manage on public.hourmeter_maintenance_thresholds for all to authenticated using (
  company_id = public.rbac_request_company_id() and public.rbac_has_capability(company_id, 'manage', 'hour-meters', 'hour-meters')
) with check (
  company_id = public.rbac_request_company_id() and public.rbac_has_capability(company_id, 'manage', 'hour-meters', 'hour-meters')
);
insert into public.rbac_permissions (id, action, resource) values
  (gen_random_uuid(), 'manage', 'hour-meters') on conflict (action, resource) do nothing;
