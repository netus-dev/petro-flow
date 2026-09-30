-- Seed all rig locations from the current catalog.
do $$
declare v_company_id uuid := 'f1000000-0000-0000-0000-000000000001'; v_location_name text; begin
  if v_company_id is null then raise exception 'Set v_company_id before executing this snippet'; end if;
  foreach v_location_name in array array['RIG 702', 'RIG 703'] loop
    update public.locations set type='rig'::public.location_type, is_active=true
    where company_id=v_company_id and name=v_location_name;
    if not found then
      insert into public.locations(name,type,company_id,is_active)
      values(v_location_name, 'rig'::public.location_type, v_company_id, true);
    end if;
  end loop;
end $$;
