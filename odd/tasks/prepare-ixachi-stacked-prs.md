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
- Initial repository label inventory had `enhancement` but no `status:approved` or `type:*`; this task created the required labels as recorded below.

## Privacy and review constraints
- The repo is public. The issue body was sanitized; it does not include company names, user UUIDs, emails, or deployment details.
- The current public branch already contains hard-coded production identifiers in snippets 7 and 8. User explicitly authorized parameterizing these snippets; existing public commit history will remain unchanged and still contains the previous values.
- User authorized creating/applying `status:approved` to issue #31 and creating `type:bug` and `type:feature` labels.
- The 696-line candidate exceeds the 400-line limit; user selected stacked PRs.
- ODD task/process records should be excluded from product slices; they contain production identifiers and personal account details.

## Created issue
- Public issue `#31`: https://github.com/netus-dev/petro-flow/issues/31
- Title: `Support company-scoped catalog access and explicit RBAC onboarding scopes`
- State: OPEN; labels `enhancement` and `status:approved`.
- Target-host read-back confirmed the title and body match after newline normalization. The issue body contains no company name, user UUID, email, hostname, home path, credentials, or private deployment detail.
- The user explicitly authorized issue approval and label creation. The `status:approved` label was created and applied to #31.

## PR labels
- Created `status:approved` (green) and applied it to issue #31.
- Created `type:bug` and `type:feature` for the two proposed product slices.
- Read-back confirmed all three labels and the issue approval label.

## Native review status
- Built isolated PR1 candidate branch `fix/ixachi-catalog-operations-gate` at commit `0062fbb609f2061fc7ee596f881a93994a5f1e0d` in the user-authorized worktree `/Users/oalonso/Documents/GitHub/Personal/petro-flow-pr-slices`.
- Native review lineage `review-caf2e951f5ab49f8` reviewed one committed path (`supabase/snippets/7. assign_role_to_user.sql`, 46 lines) against `integrate-develop` commit `32661f2f5b626c39e71368ed928190004f7b3a05`.
- After the user configured reviewer routing, `review-reliability` completed; the candidate was approved and its exact acknowledgement burned the authority. Advisory finding `R3-AmbiguousLookup` is WARNING/informational, non-blocking, with no correction offered.
## PR2 candidate and review-start blocker
- Built `feat/ixachi-rbac-provisioning-scopes` at commit `a496cf8bdf28858c200bb689c6e6744fd0995886` in the same authorized worktree, stacked on `fix/ixachi-catalog-operations-gate`.
- Static Git verification confirmed a clean worktree and exactly one changed path relative to PR1: `supabase/snippets/8. provision_user_company_role.sql`, 399 additions/0 deletions; `git diff --check` passed. No live SQL or direct snippet test was run.
- PR2 native review could not start: two START attempts after inspect returned `consent-binding-expired` with `native_invocation_attempted=false`, `lineage_created=false`, and `mutation_performed=false`. No PR2 review lineage exists; do not use the failed proposed lineage for STATUS/advance. The candidate remains unchanged.
- No PR or push has occurred. A fresh valid START/consent flow is needed before reviewing PR2.

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
4. [x] Create/apply approved/type labels to issue #31 and resolve the issue approval gate.
5. [x] Create clean stacked PR slices under 400 changed lines, excluding ODD process docs. (PR1: 46 lines; PR2: 399 lines.)
6. [ ] Create and verify PRs after the approval/label gates; do not merge.
7. [x] Configure reviewer routing and complete PR1 native review; approval acknowledged.
8. [ ] Obtain a fresh valid PR2 START consent and complete native review. (Current START attempts failed before invocation because consent bindings were expired.)

## Relevant files
- `supabase/snippets/7. assign_role_to_user.sql`
- `supabase/snippets/8. provision_user_company_role.sql`
- `odd/tasks/ixachi-operations-module-for-catalog-rbac.md`
- `odd/tasks/onboard-calidad-user-ixachi.md`
- `odd/tasks/rig-manager-onboarding-ixachi.md`
- `odd/tasks/assign-calidad-existing-user-ixachi.md`
- `odd/tasks/grant-all-rigs-to-calidad-user-ixachi.md`
- `odd/tasks/review-commit-publish-local-branches.md`
