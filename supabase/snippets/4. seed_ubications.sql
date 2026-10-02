-- Seed all asset ubications from the current catalog.
do $$
declare v_company_id uuid := 'f1000000-0000-0000-0000-000000000001'; v_ubication_name text; begin
  if v_company_id is null then raise exception 'Set v_company_id before executing this snippet'; end if;
  foreach v_ubication_name in array array['PATIO', 'SET BACK', 'POZO', 'CHANGERA', 'PISO'] loop
    update public.ubications set is_active=true, allow_multi_assets=true
    where company_id=v_company_id and name=v_ubication_name;
    if not found then
      insert into public.ubications(name,company_id,is_active,allow_multi_assets)
      values(v_ubication_name, v_company_id, true, true);
    end if;
  end loop;
end $$;
