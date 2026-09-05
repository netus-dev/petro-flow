-- Remove traceability read only from Ixachi supervisor roles.
delete from public.rbac_role_permissions rp
using public.rbac_roles r, public.rbac_companies c, public.rbac_permissions p
where rp.role_id = r.id
  and r.company_id = c.id
  and rp.permission_id = p.id
  and c.id = 'f1000000-0000-0000-0000-000000000001'
  and r.name in ('Supervisor Electrician', 'Supervisor Mechanic')
  and p.action = 'read'
  and p.resource = 'trazabilidad';
