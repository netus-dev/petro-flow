begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

select is(
  (select count(*) from public.hourmeters_settings s join public.rbac_companies c on c.id = s.company_id where c.name = 'Perforadora Integral de Oriente Ixachi'),
  1::bigint,
  'Ixachi has Hour Meters eligibility settings'
);
select ok(
  (select qual::text from pg_policies where schemaname = 'public' and tablename = 'assets' and policyname = 'assets_same_company_read') like '%read%assets%trazabilidad%',
  'asset read retains the Traceability capability path'
);
select ok(
  (select qual::text from pg_policies where schemaname = 'public' and tablename = 'assets' and policyname = 'assets_same_company_read') like '%read%hour-meters%hour-meters%',
  'asset read includes the canonical Hour Meters capability path'
);
select ok(
  (select qual::text from pg_policies where schemaname = 'public' and tablename = 'assets' and policyname = 'assets_same_company_read') like '%rbac_operational_rig_allowed%',
  'Hour Meters asset reads retain operational Rig scope'
);
select ok(
  (select qual::text from pg_policies where schemaname = 'public' and tablename = 'assets' and policyname = 'assets_same_company_read') like '%eligible_functional_principles%',
  'Hour Meters asset reads expose only eligible functional principles'
);
select is(
  (select count(*) from public.rbac_role_permissions rp join public.rbac_roles r on r.id = rp.role_id join public.rbac_permissions p on p.id = rp.permission_id join public.rbac_companies c on c.id = r.company_id where c.name = 'Perforadora Integral de Oriente Ixachi' and r.name in ('Supervisor Electrician', 'Supervisor Mechanic') and p.action = 'read' and p.resource = 'trazabilidad'),
  0::bigint,
  'supervisors remain excluded from Traceability'
);
select is(
  (select count(*) from public.rbac_role_permissions rp join public.rbac_roles r on r.id = rp.role_id join public.rbac_permissions p on p.id = rp.permission_id join public.rbac_companies c on c.id = r.company_id where c.name = 'Perforadora Integral de Oriente Ixachi' and r.name in ('Supervisor Electrician', 'Supervisor Mechanic') and p.action = 'read' and p.resource = 'hour-meters'),
  2::bigint,
  'supervisors retain canonical Hour Meters read access'
);
select is(
  (select count(*) from public.rbac_company_modules cm join public.rbac_companies c on c.id = cm.company_id where c.name = 'Perforadora Integral de Oriente Ixachi' and cm.module_key in ('hour-meters', 'trazabilidad') and cm.enabled),
  2::bigint,
  'Hour Meters and Traceability modules remain enabled independently'
);

select * from finish();
rollback;
