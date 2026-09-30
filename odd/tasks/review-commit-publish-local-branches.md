# Review, commit, and publish local work branches

## Goal
Review current local work, commit Ixachi onboarding records in separate work units, then publish the local feature branches for later PR preparation. Do not create PRs in this task.

## Current branch and working-tree scope
- Current branch: `fix/ixachi-operations-catalog-rbac`, local/remote tip `5c179a416e2ef1d14d2c92cb5069c0692ef8705d` after publication.
- Its five work-unit commits before the tracking-note follow-up were fast-forward published; the follow-up tracking commit will also be published.
- The Calidad assignment and all-rigs task docs are committed separately.
- Exclude ambient changes: modified seed snippets 1–6, untracked `supabase/migrations/20260929100000_restore_authenticated_asset_stats_rpc.sql`, and `supabase/snippets/Untitled query 868.sql`.

## Local branch inventory
- `fix/ixachi-operations-catalog-rbac`: published fast-forward; local and live origin tip matched at `5c179a416e2ef1d14d2c92cb5069c0692ef8705d`.
- `feature/rbac-multitenant-audit-admin`: 6 local commits ahead of its cached upstream; includes hour-meter/RBAC feature and tests.
- `module/trazability`: 3 local commits ahead of its cached upstream; includes Speckit workflow and constitution documentation.
- Other local branches are not ahead of their upstreams.
- Live `git ls-remote` returned no refs for `feature/rbac-multitenant-audit-admin` or `module/trazability`; pushing either would create a new remote branch. Confirm before creating these refs.
- No PR will be opened. Push only fast-forward updates to existing refs; never force-push.

## Tasks
1. [x] Inventory worktree paths, branch refs, and local-only commit contents; identify unrelated files to exclude.
2. [x] Commit the Calidad assignment evidence as its own documentation work unit.
3. [x] Commit the all-rigs scope evidence as its own documentation work unit.
4. [x] Publish `fix/ixachi-operations-catalog-rbac` as a fast-forward update to its existing remote ref.
5. [ ] Verify the pushed ref and get explicit direction before creating missing remote refs for the other two local-ahead branches; leave PR creation to the user. (in progress)

## Verification and delivery constraints
- Stage exact paths only and inspect the staged path list before each commit.
- The two task-document commits have no runtime test command; they document already-verified production state.
- The existing unrelated worktree changes must remain untouched and absent from commits.
- Check live remote heads before push; if any branch moved or a push is non-fast-forward, stop without force-pushing.
- No PR creation, merge, release, or production DML in this task.

## Commit evidence
- Existing current-branch commits: `ceb5da5f8dbf39790a905bc13bca91debeca631a`, `dd238b73da9c0234f55ab4f6face9c7a47ef8d26`, `bd5b8e1ed4c19a872c11ae522f68819a355a6dfc`.
- Calidad assignment docs: `2720cfd6a7731e24db9375c2cda3760baf8d2538` — `docs(odd): record Calidad assignment evidence`.
- All-rigs scope docs: `c4abcfad8bb69cc9600b134309a4d41445585e1d` — `docs(odd): record Calidad all-rigs scope`.
- Branch-publication tracking commit: `5c179a416e2ef1d14d2c92cb5069c0692ef8705d` — `docs(odd): track local branch publication`.
- Push: `git push origin fix/ixachi-operations-catalog-rbac` succeeded; live remote ref matched local tip `5c179a416e2ef1d14d2c92cb5069c0692ef8705d`.
- Other branch pushes: pending explicit decision because live remote refs are absent.
