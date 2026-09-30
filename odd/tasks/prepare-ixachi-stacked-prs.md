# Prepare stacked PRs for Ixachi RBAC work

## Goal
Create a privacy-safe tracking issue and prepare the published Ixachi branch for stacked PRs targeting `integrate-develop`. Do not merge or release.

## Read-only preflight
- Repository: public `netus-dev/petro-flow`; issues enabled and blank issue fallback explicitly enabled.
- Source: `fix/ixachi-operations-catalog-rbac`; no existing PR.
- User confirmed target `integrate-develop` and selected stacked PRs.
- Candidate diff against `origin/integrate-develop`: 8 changed paths, 696 additions.
- No relevant duplicate issue found. Visible issues #11–#14 are unrelated and none has `status:approved`.
- No repository issue form, PR template, or nomenclature guide was found.
- Existing repo labels have `enhancement` but no `status:approved` and no `type:*` labels.

## Privacy and review constraints
- The repo is public. The issue body was sanitized; it does not include company names, user UUIDs, emails, or deployment details.
- The current public branch already contains hard-coded production identifiers in snippets 7 and 8. User explicitly authorized parameterizing these snippets; existing public commit history will remain unchanged and still contains the previous values.
- User authorized creating/applying `status:approved` to issue #31 and creating `type:bug` and `type:feature` labels.
- The 696-line candidate exceeds the 400-line limit; user selected stacked PRs.
- ODD task/process records should be excluded from product slices; they contain production identifiers and personal account details.

## Created issue
- Public issue `#31`: https://github.com/netus-dev/petro-flow/issues/31
- Title: `Support company-scoped catalog access and explicit RBAC onboarding scopes`
- State: OPEN; label `enhancement`.
- Target-host read-back confirmed the title and body match after newline normalization. The issue body contains no company name, user UUID, email, hostname, home path, credentials, or private deployment detail.
- The issue is not marked approved. The repository has no `status:approved` label and no `type:*` labels.

## Implementation evidence
- Parameterized snippet 7: required company UUID, role, and target email default to NULL and are validated before database access.
- Parameterized snippet 8: required company/user/role inputs and scope mode default to NULL; the reviewed permissions remain pinned; the expected copy-source scope defaults empty and exact-snapshot checks remain fail-closed.
- Static verification: `git diff --check` passed; no production UUID/email/company/rig identifiers remain in either snippet. Both SQL files were 46 and 399 lines respectively, and neither exists on the target branch, so each product-only slice stays below 400 additions.
- No direct automated test covers these operational DO-block snippets. No live SQL was executed because it would mutate database state.
- Work-unit commits on `fix/ixachi-operations-catalog-rbac`: `f0d554b` (`fix(rbac): parameterize catalog access snippet`) and `b48073a` (`feat(rbac): require explicit provisioning inputs`).
- Existing public history was not rewritten; earlier published commits still contain the previous values.

## Proposed product PR slices
The original 696-line diff is 36 additions in snippet 7, 390 in snippet 8, and 270 across six ODD task documents. The final parameterized snippets are 46 and 399 lines.
1. `fix(rbac): enable catalog operations gate` — `supabase/snippets/7. assign_role_to_user.sql` only (46 additions; `type:bug`).
2. `feat(rbac): support explicit onboarding scopes` — `supabase/snippets/8. provision_user_company_role.sql` only (399 additions; `type:feature`), stacked on PR 1.
- Exclude all six ODD process/evidence docs from product PRs.

## Tasks
1. [x] Verify repo, target branch, issue settings/forms/labels, duplicate search, PR state, diff size, and stacked strategy.
2. [x] Create privacy-safe issue #31 and verify its target-host read-back.
3. [x] Parameterize production values in snippets 7 and 8; leave public history unchanged. Commit IDs recorded above.
4. [ ] Create/apply approved/type labels to issue #31 and resolve the issue approval gate. (in progress)
5. [ ] Create clean stacked PR slices under 400 changed lines, excluding ODD process docs.
6. [ ] Create and verify PRs after the approval/label gates; do not merge.

## Relevant files
- `supabase/snippets/7. assign_role_to_user.sql`
- `supabase/snippets/8. provision_user_company_role.sql`
- `odd/tasks/ixachi-operations-module-for-catalog-rbac.md`
- `odd/tasks/onboard-calidad-user-ixachi.md`
- `odd/tasks/rig-manager-onboarding-ixachi.md`
- `odd/tasks/assign-calidad-existing-user-ixachi.md`
- `odd/tasks/grant-all-rigs-to-calidad-user-ixachi.md`
- `odd/tasks/review-commit-publish-local-branches.md`
