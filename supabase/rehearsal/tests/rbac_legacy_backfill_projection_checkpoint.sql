-- Local-only pre-retirement checkpoint.
-- This file is intentionally not part of the normal Supabase test discovery.
-- The transaction rolls back the temporary legacy contracts and all fixture data.
begin;

create extension if not exists pgtap with schema extensions;

create table public.companies (
  id uuid primary key,
  name text not null,
  is_active boolean not null default true
);

alter table public.users add column company_id uuid;
alter table public.users add constraint users_company_id_checkpoint_fk
  foreign key (company_id) references public.companies(id);
alter table public.roles drop constraint if exists fk_roles_company_id_rbac_companies;
alter table public.permissions drop constraint if exists fk_permissions_company_id_rbac_companies;

-- Reinstall only the retired rehearsal function for this transaction. The
-- migration itself is never recorded or applied to the final schema.
\ir ../migrations/20260827100000_local_rbac_consolidation_rehearsal.sql

-- The final seed contains a different legacy cohort; isolate this historical
-- scenario before loading its fixed IDs.
delete from public.role_permissions;
delete from public.user_roles;
delete from public.permissions;
delete from public.roles;
delete from public.users;

\ir rbac_legacy_backfill_projection.pgtap.sql

rollback;
