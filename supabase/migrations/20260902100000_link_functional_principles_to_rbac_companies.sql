-- Functional principles are tenant-owned catalog records.
alter table public.functional_principles
  drop constraint if exists functional_principles_company_id_fkey;

alter table public.functional_principles
  add constraint functional_principles_company_id_fkey
  foreign key (company_id)
  references public.rbac_companies(id)
  on delete restrict;

create index if not exists functional_principles_company_id_idx
  on public.functional_principles(company_id);
