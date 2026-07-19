# Coordinator Portal — Security

Mirrors the Student Portal production standards.

## Authentication
- Admin-created coordinator accounts (`users`, role 'coordinator'); **no
  self-registration**. Passwords verified with **bcrypt**.
- **JWT** access (15m) + refresh (7d) in **httpOnly cookies**
  (`coordinator_access` / `coordinator_refresh`). `/auth/refresh` rotates both.
- Secrets are **required at startup** — the server refuses to boot without
  `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`. Login returns a **uniform** error.

## Authorization
- `requireAuth` + `requireCoordinator` guard every non-auth route.
- Every read/write is **cell-scoped**: a coordinator can only see/act on
  trainings, applications, students and notifications for their own cell
  (`utils/identity.js` cell-key resolution). No cross-cell access.
- Ownership enforced: the Coordinator writes only `trainings`; it never writes
  `applications` (or users/students/cells/departments/settings).

## Rate limiting
- `express-rate-limit`: 10 req / 15 min / IP on `/auth/login`. Authenticated API
  unthrottled. `trust proxy` enabled for correct IPs.

## Validation
- Backend-authoritative (`utils/validation.js`): required fields, trimming,
  max-lengths, evaluation scores constrained to 1–10, duration bounds. Frontend
  validation is UX-only.

## Headers
- **Helmet** default set (X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, HSTS in prod). Request body capped at 1 MB.

## Cookies
- httpOnly, `SameSite` env-driven (default strict), Secure in production
  (forced when SameSite=none). Cookie maxAges match token TTLs.

## Audit logs
- Appended to the shared `auditLogs` collection (`services/auditService.js`):
  `AUTH_LOGIN`, `AUTH_LOGIN_FAILED`, `AUTH_LOGOUT`, `TRAINING_STARTED`,
  `TRAINING_COMPLETED`, `EVALUATION_SUBMITTED`, `ATTENDANCE_GENERATED`,
  `SCHEDULE_UPDATED`. Best-effort; structured JSON logger for internal logs;
  generic 500s to clients (no stack/DB leakage).

## Security assumptions
- HTTPS in production (required for Secure cookies).
- Coordinator accounts have bcrypt passwords set by the Admin Portal.
- CORS allowlists exact origins (never `*`).

## Known residual risks (accepted / deferred)
1. **Stateless-JWT revocation** — logout clears cookies; a stolen token stays
   valid until expiry (bounded by 15m access TTL). No server-side denylist.
2. **Frontend silent refresh not wired** — `/auth/refresh` exists but the SPA
   does not auto-call it on 401 (access expiry → re-login).
3. **Cell credential model depends on Admin provisioning** — login resolves a
   coordinator user via the cell (`coordinatorId`) or email; if Admin provisions
   coordinators differently, the resolver may need adjustment (see MAINTENANCE).
