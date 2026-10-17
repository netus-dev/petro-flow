# Hour meter conditional registration fields

## Goal
Adjust hour-meter registration so only generator-engine assets require operational accumulated fields, while all other eligible functional principles require only capture date and hour-meter reading.

## Tasks
- [x] Map the existing hour-meter registration flow and domain constraints.
- [x] Implement conditional operational fields in the form and validation path.
- [x] Verify with focused automated tests.

## Evidence
- Started: 2026-10-02.
- Implemented domain predicate `requiresOperationalAccumulatedFields` for generator-engine detection using the exact functional principle `Motor de Combustión Interna` or generator-engine equipment names.
- Updated registration input, use case validation, mappers, mock repository, Supabase repository, and registration form so non-generator assets omit/persist `null` for diesel/MW/MVAR.
- Verification: `pnpm vitest run src/features/hour-meters/application/usecases/hour-meter.usecases.test.ts src/features/hour-meters/infrastructure/repositories/hour-meter.supabase.repository.test.ts` passed: 2 files / 16 tests.
- Commit: not created; user has not explicitly authorized a commit in this session.
