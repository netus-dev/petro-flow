-- Seed the 19 initial assets for Rig 703.
do $$
declare
  v_company_id uuid := 'f1000000-0000-0000-0000-000000000001';
  v_rig_id uuid := 'f4000000-0000-0000-0000-000000000002';
  v_principle_id uuid;
  v_location_id uuid;
  v_brand_id uuid;
  v_model_id uuid;
  v_asset record;
begin
  for v_asset in select * from (values
    ('Bomba de Lodo','Bomba de lodos 1','IXA703-SC-BOPL01-BOL01','SICHUAN HONGUA PETROLEUM EQUIPMENT CO, LTD.','HH-2400','5JNB14014'),
    ('Bomba de Lodo','Bomba de lodos 2','IXA703-SC-BOPL02-BOL02','SICHUAN HONGUA PETROLEUM EQUIPMENT CO, LTD.','HH-2400','5JNB14018'),
    ('Bomba de Lodo','Bomba de lodos 3','IXA703-SC-BOPL03-BOL03','SICHUAN HONGUA PETROLEUM EQUIPMENT CO, LTD.','HH-2400','5JNB14016'),
    ('Generador','Generador 01','IXA703-SP-MOTG01-GEN01','KATO ENGINEERING','AA27647035','34454-22'),
    ('Generador','Generador 02','IXA703-SP-MOTG02-GEN02','KATO ENGINEERING','AA27647035','34454-23'),
    ('Generador','Generador 03','IXA703-SP-MOTG03-GEN03','KATO ENGINEERING','AA27647035','34454-24'),
    ('Generador','Generador 04','IXA703-SP-MOTG04-GEN04','KATO ENGINEERING','AA27647035','35036-20'),
    ('Generador','Generador 05','IXA703-SP-MOTG05-GEN05','KATO ENGINEERING','AA27647035','35036-21'),
    ('Motor de Combustión Interna','Motor del generador 01','IXA703-SP-MOTG01-MOG01','CATERPILLAR','3512C','LLA04162'),
    ('Motor de Combustión Interna','Motor del generador 02','IXA703-SP-MOTG02-MOG02','CATERPILLAR','3512C','LLA04168'),
    ('Motor de Combustión Interna','Motor del generador 03','IXA703-SP-MOTG03-MOG03','CATERPILLAR','3512C','LLA04179'),
    ('Motor de Combustión Interna','Motor del generador 04','IXA703-SP-MOTG04-MOG04','CATERPILLAR','3512C','LLA04146'),
    ('Motor de Combustión Interna','Motor del generador 05','IXA703-SP-MOTG05-MOG05','CATERPILLAR','3512C','LLA04153'),
    ('Top Drive','Top drive','IXA703-SR-TODR01-TOD01','GLOBAL DRILLING SUPPORT','GDM-850 AC','48'),
    ('Malacate','Malacate','IXA703-SI-MALA01-MAL01','AMERICAN BLOCK','35770000-H','141325'),
    ('Llave hidráulica ST-100','Llave hidráulica ST-100','IXA703-SR-LLHS01-LHS01','NATIONAL OILWELL VARCO','ST-100','TC-5361225-01'),
    ('Unidad de Potencia Hidráulica','Unidad de Potencia Hidráulica','IXA703-SP-SIHI01-HPU01',null,null,null),
    ('Muelle Hidráulico','Muelle Hidráulico','IXA703-SI-MUHI01-MUH01','CANRIG','PC3000-42-A-A-A-N-S','300433'),
    ('Acumulador Hidráulico','Unidad Acumulador Hidráulico','IXA703-SCP-KOUN01-UAK01','NATIONAL OILWELL VARCO','2B604808B15T32A-P','C14N0121')
  ) as x(principle_name, ubication_name, property_1, brand_name, model_name, serial_number)
  loop
    select id into v_principle_id from public.functional_principles where company_id=v_company_id and name=v_asset.principle_name limit 1;
    select id into v_location_id from public.ubications where company_id=v_company_id and name=v_asset.ubication_name limit 1;
    v_brand_id := null; v_model_id := null;
    if v_asset.brand_name is not null then
      select id into v_brand_id from public.brands where company_id=v_company_id and name=v_asset.brand_name limit 1;
      select id into v_model_id from public.models where company_id=v_company_id and brand_id=v_brand_id and name=v_asset.model_name limit 1;
    end if;
    insert into public.assets (company_id,current_location_id,current_ubication_id,function_principle_id,brand_id,model_id,serial_number,property_1,status,is_active)
    select v_company_id,v_rig_id,v_location_id,v_principle_id,v_brand_id,v_model_id,v_asset.serial_number,v_asset.property_1,'active',true
    where not exists (select 1 from public.assets where company_id=v_company_id and property_1=v_asset.property_1);
  end loop;
end $$;
