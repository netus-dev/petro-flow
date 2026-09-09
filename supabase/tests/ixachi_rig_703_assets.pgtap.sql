begin;
create extension if not exists pgtap with schema extensions;
select plan(4);
select is((select count(*) from public.assets where company_id='f1000000-0000-0000-0000-000000000001' and current_location_id='f4000000-0000-0000-0000-000000000002'),19::bigint,'Rig 703 has nineteen assets');
select is((select count(*) from public.assets where company_id='f1000000-0000-0000-0000-000000000001' and current_location_id='f4000000-0000-0000-0000-000000000002' and property_1 is not null),19::bigint,'Every Rig 703 asset has property_1');
select is((select count(*) from public.assets where company_id='f1000000-0000-0000-0000-000000000001' and current_location_id='f4000000-0000-0000-0000-000000000002' and status='active' and is_active),19::bigint,'All Rig 703 assets are active');
select is((select count(*) from public.assets where company_id='f1000000-0000-0000-0000-000000000001' and current_location_id='f4000000-0000-0000-0000-000000000002' and serial_number is null),1::bigint,'One Rig 703 asset has no serial number');
select * from finish();
rollback;
