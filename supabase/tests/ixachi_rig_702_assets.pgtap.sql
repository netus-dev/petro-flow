begin;
create extension if not exists pgtap with schema extensions;
select plan(6);
select is((select count(*) from public.functional_principles where company_id='f1000000-0000-0000-0000-000000000001'), 9::bigint, 'Ixachi has nine functional principles');
select results_eq($$select name from public.functional_principles where company_id = 'f1000000-0000-0000-0000-000000000001' order by name$$, $$values
  ('Acumulador Hidráulico'::text),
  ('Bomba de Lodo'::text),
  ('Generador'::text),
  ('Llave hidráulica ST-100'::text),
  ('Malacate'::text),
  ('Motor de Combustión Interna'::text),
  ('Muelle Hidráulico'::text),
  ('Top Drive'::text),
  ('Unidad de Potencia Hidráulica'::text)$$, 'Ixachi functional principle names remain exact');
select is((select count(*) from public.assets where company_id='f1000000-0000-0000-0000-000000000001' and current_location_id='f4000000-0000-0000-0000-000000000001'), 19::bigint, 'Rig 702 has nineteen assets');
select is((select count(*) from public.assets where company_id='f1000000-0000-0000-0000-000000000001' and property_1 is not null), 19::bigint, 'Every asset has property_1');
select is((select count(*) from public.assets where company_id='f1000000-0000-0000-0000-000000000001' and status='active' and is_active), 19::bigint, 'All Rig 702 assets are active');
select is((select count(*) from public.assets where company_id='f1000000-0000-0000-0000-000000000001' and serial_number is null), 2::bigint, 'Two assets have no serial number');
select * from finish();
rollback;
