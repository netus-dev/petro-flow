-- Seed functional-principle scopes.
-- TODO: set the company_id before executing.
do $$
declare
  v_company_id uuid := 'f1000000-0000-0000-0000-000000000001';
begin
  if v_company_id is null then
    raise exception 'Set v_company_id before executing this snippet';
  end if;

  insert into public.functional_principle_scopes (code, name, company_id)
  select source.code, source.name, v_company_id
  from (values
    ('land_rigs', 'Land Rigs'),
    ('tubular', 'Tubulares')
  ) as source(code, name)
  where not exists (
    select 1
    from public.functional_principle_scopes existing
    where existing.code = source.code
      and existing.company_id = v_company_id
  );
end $$;
