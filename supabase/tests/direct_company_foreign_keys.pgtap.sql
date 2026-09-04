begin;
create extension if not exists pgtap with schema extensions;
select plan(21);

select ok(not exists (select 1 from public.locations where name in ('Base Norte', 'Pozo Alfa') and company_id is null), 'orphan legacy locations are removed');
select ok(not exists (select 1 from public.assets a join public.locations l on l.id = a.current_location_id where l.name in ('Base Norte', 'Pozo Alfa') and l.company_id is null), 'orphan legacy assets are removed');

select is((select confrelid::regclass::text from pg_constraint where conname = 'locations_company_id_fkey'), 'rbac_companies', 'locations FK references rbac_companies');
select is((select array_agg(a.attname order by k.ordinality)::text from pg_constraint c join unnest(c.conkey) with ordinality k(attnum, ordinality) on true join pg_attribute a on a.attrelid = c.conrelid and a.attnum = k.attnum where c.conname = 'locations_company_id_fkey'), '{company_id}', 'locations FK targets company_id');
select is((select array_agg(a.attname order by k.ordinality)::text from pg_constraint c join unnest(c.confkey) with ordinality k(attnum, ordinality) on true join pg_attribute a on a.attrelid = c.confrelid and a.attnum = k.attnum where c.conname = 'locations_company_id_fkey'), '{id}', 'locations FK references id');
select is((select confdeltype from pg_constraint where conname = 'locations_company_id_fkey'), 'r', 'locations FK uses RESTRICT');
select is((select confrelid::regclass::text from pg_constraint where conname = 'rbac_roles_company_id_fkey'), 'rbac_companies', 'roles FK references rbac_companies');
select is((select conrelid::regclass::text from pg_constraint where conname = 'rbac_roles_company_id_fkey'), 'rbac_roles', 'roles FK is attached to rbac_roles');
select is((select array_agg(a.attname order by k.ordinality)::text from pg_constraint c join unnest(c.conkey) with ordinality k(attnum, ordinality) on true join pg_attribute a on a.attrelid = c.conrelid and a.attnum = k.attnum where c.conname = 'rbac_roles_company_id_fkey'), '{company_id}', 'roles FK targets company_id');
select is((select confdeltype from pg_constraint where conname = 'rbac_roles_company_id_fkey'), 'c', 'roles FK uses CASCADE');
select is((select confrelid::regclass::text from pg_constraint where conname = 'rbac_audit_events_company_id_fkey'), 'rbac_companies', 'audit FK references rbac_companies');
select is((select conrelid::regclass::text from pg_constraint where conname = 'rbac_audit_events_company_id_fkey'), 'rbac_audit_events', 'audit FK is attached to rbac_audit_events');
select is((select array_agg(a.attname order by k.ordinality)::text from pg_constraint c join unnest(c.conkey) with ordinality k(attnum, ordinality) on true join pg_attribute a on a.attrelid = c.conrelid and a.attnum = k.attnum where c.conname = 'rbac_audit_events_company_id_fkey'), '{company_id}', 'audit FK targets company_id');
select is((select array_agg(a.attname order by k.ordinality)::text from pg_constraint c join unnest(c.confkey) with ordinality k(attnum, ordinality) on true join pg_attribute a on a.attrelid = c.confrelid and a.attnum = k.attnum where c.conname = 'rbac_audit_events_company_id_fkey'), '{id}', 'audit FK references id');
select is((select confdeltype from pg_constraint where conname = 'rbac_audit_events_company_id_fkey'), 'n', 'audit FK uses SET NULL');

insert into public.rbac_companies (id, name) values (gen_random_uuid(), 'FK Test Company ' || gen_random_uuid());
select throws_ok($$insert into public.locations (id, name, type, company_id) values (gen_random_uuid(), 'Invalid Location', 'rig', 'ffffffff-ffff-ffff-ffff-ffffffffffff')$$, '23503', null, 'invalid location company is rejected');
select throws_ok($$insert into public.rbac_roles (id, name, company_id) values (gen_random_uuid(), 'invalid-role-' || gen_random_uuid(), 'ffffffff-ffff-ffff-ffff-ffffffffffff')$$, '23503', null, 'invalid role company is rejected');
select throws_ok($$insert into public.rbac_audit_events (company_id, event_type, outcome) values ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'fk-test', 'denied')$$, '23503', null, 'invalid audit company is rejected');

insert into public.locations (id, name, type, company_id) select gen_random_uuid(), 'Restrict Location', 'rig', id from public.rbac_companies where name like 'FK Test Company %';
select throws_ok($$delete from public.rbac_companies where name like 'FK Test Company %'$$, '23503', null, 'company deletion is restricted by locations');
delete from public.locations where name = 'Restrict Location';
insert into public.rbac_roles (id, name, company_id) select gen_random_uuid(), 'cascade-role', id from public.rbac_companies where name like 'FK Test Company %';
insert into public.rbac_audit_events (company_id, event_type, outcome) select id, 'fk-test', 'denied' from public.rbac_companies where name like 'FK Test Company %';
delete from public.rbac_companies where name like 'FK Test Company %';
select ok(not exists (select 1 from public.rbac_roles where name = 'cascade-role'), 'company deletion cascades to roles');
select is((select company_id from public.rbac_audit_events where event_type = 'fk-test'), null::uuid, 'company deletion preserves audit and nulls company_id');

select * from finish();
rollback;
