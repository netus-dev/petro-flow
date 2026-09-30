-- Certificates attached to a movement transaction are distinct from direct
-- asset certificates. Existing assets_certificates rows remain unchanged.
create table if not exists public.transactions_certificates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  transaction_id uuid not null,
  certificate_id uuid not null,
  created_at timestamptz not null default now(),
  foreign key (company_id, transaction_id)
    references public.transactions(company_id, id) on delete cascade,
  foreign key (company_id, certificate_id)
    references public.certificates(company_id, id) on delete restrict,
  unique (transaction_id, certificate_id)
);

create index if not exists transactions_certificates_transaction_idx
  on public.transactions_certificates (transaction_id);
create index if not exists transactions_certificates_certificate_idx
  on public.transactions_certificates (certificate_id);

alter table public.transactions_certificates enable row level security;
revoke all on table public.transactions_certificates from anon;
grant select, insert, update, delete on table public.transactions_certificates to authenticated;

drop policy if exists transactions_certificates_traceability_read on public.transactions_certificates;
create policy transactions_certificates_traceability_read
  on public.transactions_certificates for select to authenticated
  using (
    company_id = public.rbac_request_company_id()
    and public.rbac_has_capability(company_id, 'read', 'certificates', 'operations')
  );

drop policy if exists transactions_certificates_traceability_write on public.transactions_certificates;
create policy transactions_certificates_traceability_write
  on public.transactions_certificates for all to authenticated
  using (
    company_id = public.rbac_request_company_id()
    and public.rbac_has_capability(company_id, 'update', 'certificates', 'operations')
  )
  with check (
    company_id = public.rbac_request_company_id()
    and public.rbac_has_capability(company_id, 'create', 'certificates', 'operations')
  );

comment on table public.transactions_certificates is
  'Tenant-scoped certificate-to-movement relationship used by traceability.';
