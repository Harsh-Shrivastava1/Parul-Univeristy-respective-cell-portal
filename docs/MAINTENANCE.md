# Coordinator Portal — Maintenance Notes

Feature-complete and frozen — bug fixes, dependency updates, and maintenance only.

## Deferred work
- **Frontend silent refresh** — wire an `apiClient` interceptor to call
  `POST /auth/refresh` on 401 and retry (sessions currently end at access-token
  expiry until re-login).
- **Password-change / session revocation** — coordinators do not self-manage
  passwords (Admin-owned). Stateless JWTs cannot be revoked without a denylist;
  bounded by the 15m access TTL.

## Cross-portal assumptions (verify against Admin/TEC in a live environment)
- **Coordinator ↔ cell provisioning:** login resolves the coordinator user via
  `cells.coordinatorId` or by email. If Admin links coordinators to cells
  differently (e.g. only via `department`, or via cell `loginId`/`loginPassword`),
  adjust `server/services/authService.login` + `utils/identity.js`.
- **`applications.assignedCellId` format:** cell scoping matches
  `assignedCellId` against the coordinator's cell keys (`cell.id`, `cell.cellId`).
  If TEC stores a different cell identifier, extend `utils/identity.cellKeys`.
- **Application-status projection:** performed by the TEC backend from training
  events (read-time enrichment). If a dedicated change-stream consumer is added
  in TEC, no Coordinator change is required — the Coordinator only writes
  `trainings` and emits events.

## Known limitations
- **Coordinator notification feed** depends on TEC creating `notifications` with
  `assignedCellId` (e.g. NEW_ASSIGNMENT on assignment). Until TEC does so, the
  feed shows only notifications this portal created.
- **Attendance Form** generation is complete here; students download it via the
  Student Portal (`applications`/`trainings` reference surfaced there).
- **No automated tests**; backend verified via `node --check`, frontend by
  static analysis (no in-repo build run — run `tsc`/`vite build` + `npm audit`
  in CI).

## Technical debt
- Small `genId` helpers are duplicated across `authService`/`auditService`/
  `trainingService` (mirrors the Student Portal); consolidation deferred to avoid
  untested refactors during the freeze.

## Removed during cleanup
- Mock data layer (`src/mock/db.ts`), mock `emailService`, dead axios client
  (`src/lib/api.ts`), unused types (`Cell`, `StudentWithDetails`), unused store
  methods (`getUserId`, `getDepartment`), unused deps (`recharts`, `date-fns`).

## Future enhancements (out of scope)
- Realtime notifications; direct transactional email; automated test suite;
  session-revocation store.
