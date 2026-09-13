insert into public.rbac_operational_scopes (company_id, user_id, all_rigs)
values ('92000000-0000-0000-0000-000000000004', 'd64468dc-0270-4c46-bc32-60cdeb91cc45', true)
on conflict (company_id, user_id) do update set all_rigs = true;