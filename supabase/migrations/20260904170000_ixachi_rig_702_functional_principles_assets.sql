-- Seed functional principles and the 19 initial assets for Rig 702.
do $$
declare
  v_company_id uuid := 'f1000000-0000-0000-0000-000000000001';
  v_rig_id uuid := 'f4000000-0000-0000-0000-000000000001';
  v_principle_id uuid;
  v_location_id uuid;
  v_brand_id uuid;
  v_model_id uuid;
  v_asset record;
begin
  for v_asset in select * from (values
    ('Bomba de Lodo', 'Bomba de lodos 1', 'IXA702-SC-BOPL01-BOL01', 'SICHUAN HONGUA PETROLEUM EQUIPMENT CO, LTD.', 'HH-2400', '5JNB14012'),
    ('Bomba de Lodo', 'Bomba de lodos 2', 'IXA702-SC-BOPL02-BOL02', 'SICHUAN HONGUA PETROLEUM EQUIPMENT CO, LTD.', 'HH-2400', '5JNB14013'),
    ('Bomba de Lodo', 'Bomba de lodos 3', 'IXA702-SC-BOPL03-BOL03', 'SICHUAN HONGUA PETROLEUM EQUIPMENT CO, LTD.', 'HH-2400', '5JNB14009'),
    ('Generador', 'Generador 01', 'IXA702-SP-MOTG01-GEN01', 'KATO ENGINEERING', 'AA27647035', '35036-12'),
    ('Generador', 'Generador 02', 'IXA702-SP-MOTG02-GEN02', 'KATO ENGINEERING', 'AA27647035', '35036-10'),
    ('Generador', 'Generador 03', 'IXA702-SP-MOTG03-GEN03', 'KATO ENGINEERING', 'AA27647035', '35036-08'),
    ('Generador', 'Generador 04', 'IXA702-SP-MOTG04-GEN04', 'KATO ENGINEERING', 'AA27647035', '35036-09'),
    ('Generador', 'Generador 05', 'IXA702-SP-MOTG05-GEN05', 'KATO ENGINEERING', 'AA27647035', '35036-11'),
    ('Motor de Combustión Interna', 'Motor del generador 01', 'IXA702-SP-MOTG01-MOG01', 'CATERPILLAR', '3512C', 'LLA04259'),
    ('Motor de Combustión Interna', 'Motor del generador 02', 'IXA702-SP-MOTG02-MOG02', 'CATERPILLAR', '3512C', 'LLA04168'),
    ('Motor de Combustión Interna', 'Motor del generador 03', 'IXA702-SP-MOTG03-MOG03', 'CATERPILLAR', '3512C', 'LLA04339'),
    ('Motor de Combustión Interna', 'Motor del generador 04', 'IXA702-SP-MOTG04-MOG04', 'CATERPILLAR', '3512C', 'LLA04340'),
    ('Motor de Combustión Interna', 'Motor del generador 05', 'IXA702-SP-MOTG05-MOG05', 'CATERPILLAR', '3512C', 'LLA04344'),
    ('Top Drive', 'Top drive', 'IXA702-SR-TODR01-TOD01', 'GLOBAL DRILLING SUPPORT', 'GDM-850 AC', '017'),
    ('Malacate', 'Malacate', 'IXA702-SI-MALA01-MAL01', 'AMERICAN BLOCK', '35770000-H', '142969'),
    ('Llave hidráulica ST-100', 'Llave hidráulica ST-100', 'IXA702-SR-LLHS01-LHS01', 'NATIONAL OILWELL VARCO', 'ST-100', null),
    ('Unidad de Potencia Hidráulica', 'Unidad de Potencia Hidráulica', 'IXA702-SP-SIHI01-HPU01', 'CANRIG', 'PC3000-42-A-A-A-N-S', null),
    ('Muelle Hidráulico', 'Muelle Hidráulico', 'IXA702-SI-MUHI01-MUH01', 'CANRIG', 'PC3000-42-A-A-A-N-S', '300433'),
    ('Acumulador Hidráulico', 'Unidad Acumulador Hidráulico', 'IXA702-SCP-KOUN01-UAK01', 'NATIONAL OILWELL VARCO', '2B604808B15T32A-P', 'C14N020')
  ) as x(principle_name, ubication_name, property_1, brand_name, model_name, serial_number)
  loop
    select id into v_principle_id from public.functional_principles
      where company_id = v_company_id and name = v_asset.principle_name limit 1;
    if v_principle_id is null then
      insert into public.functional_principles (name, company_id, is_active)
      values (v_asset.principle_name, v_company_id, true) returning id into v_principle_id;
    end if;
    select id into v_location_id from public.ubications
      where company_id = v_company_id and name = v_asset.ubication_name limit 1;
    select id into v_brand_id from public.brands
      where company_id = v_company_id and name = v_asset.brand_name limit 1;
    select id into v_model_id from public.models
      where company_id = v_company_id and brand_id = v_brand_id and name = v_asset.model_name limit 1;
    insert into public.assets (company_id, current_location_id, current_ubication_id, function_principle_id,
      brand_id, model_id, serial_number, property_1, status, is_active)
    select v_company_id, v_rig_id, v_location_id, v_principle_id, v_brand_id, v_model_id,
      v_asset.serial_number, v_asset.property_1, 'active', true
    where not exists (select 1 from public.assets where company_id = v_company_id and property_1 = v_asset.property_1);
  end loop;
end $$;
