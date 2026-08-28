# Local Legacy Backfill Checkpoint

`supabase/tests/rbac_legacy_backfill_projection.pgtap.sql` covers the historical
projection while `public.companies` and `public.users.company_id` still exist.
Those objects are retired from the final local schema, so the assertions are
executed only through the checkpoint harness:

```bash
supabase db reset --local
bash scripts/run-local-legacy-backfill-checkpoint.sh
```

The harness opens one transaction, creates the minimum pre-retirement table and
column contracts, includes the historical pgTAP assertions, and rolls back.
It is not automatically discovered by the normal suite. A successful run does
not add compatibility tables, migrations, seed data, or other permanent schema
objects. Run the final-state suite and `supabase db reset --local` separately as
the ordinary verification path.
