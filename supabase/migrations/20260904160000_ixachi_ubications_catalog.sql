-- Seed the initial equipment-location catalog for the Ixachi company.
do $$
declare
  v_company_id uuid := 'f1000000-0000-0000-0000-000000000001';
  v_name text;
begin
  foreach v_name in array array[
    'Bomba de lodos 1',
    'Bomba de lodos 2',
    'Bomba de lodos 3',
    'Generador 01',
    'Generador 02',
    'Generador 03',
    'Generador 04',
    'Generador 05',
    'Motor del generador 01',
    'Motor del generador 02',
    'Motor del generador 03',
    'Motor del generador 04',
    'Motor del generador 05',
    'Top drive',
    'Malacate',
    'Llave hidráulica ST-100',
    'Unidad de Potencia Hidráulica',
    'Muelle Hidráulico',
    'Unidad Acumulador Hidráulico'
  ]
  loop
    if not exists (
      select 1 from public.ubications
      where company_id = v_company_id and name = v_name
    ) then
      insert into public.ubications (name, company_id, is_active, allow_multi_assets)
      values (v_name, v_company_id, true, false);
    end if;
  end loop;
end $$;
