# Local Rehearsal SQL

Files in this directory are intentionally outside `supabase/migrations`, so the
Supabase CLI never applies them during `supabase db reset`, `db push`, or deploy.
They preserve the disposable legacy-RBAC compatibility fixture and its staged
cutover rehearsals for local investigation only.

To run a rehearsal, start the local stack, apply the production chain and seed,
then execute the SQL files in timestamp order with a local `psql` connection,
and run the files in `rehearsal/tests` individually with `psql` when validating
the rehearsal. The
fixture must run before the hardening and projection files; the four
`20260827*` files run in timestamp order after the fixture. Rehearsal SQL may
drop legacy objects and must never be run against a remote database.
