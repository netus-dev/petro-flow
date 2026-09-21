-- Allow traceability roles to register movements through the guarded RPC.
insert into public.rbac_permissions (id, action, resource)
values (gen_random_uuid(), 'create', 'movements')
on conflict (action, resource) do nothing;

insert into public.rbac_role_permissions (role_id, permission_id)
select r.id, p.id
from public.rbac_roles r
cross join public.rbac_permissions p
where lower(r.name) in ('supervisor electrician', 'supervisor mechanic', 'tool pusher', 'developer')
  and p.action = 'create'
  and p.resource = 'movements'
on conflict do nothing;
