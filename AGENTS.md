# AGENTS.md — Department Coordinator portal (`Parul-respective-cell-portal`)

**Read [`SYSTEM.md`](SYSTEM.md) first.** It describes all four portals, the
shared database, the application lifecycle, deployment and the decision log.
This file adds what is specific to this repo. Where `docs/` or `README.md`
disagree with the code, they are stale: the code wins, then `SYSTEM.md`. The
old "cell" concept is gone: a coordinator belongs to one administrative
**department**.

## What this portal owns

* **`trainings`**: create/start, schedule, evaluation, completion, plus the
  attendance form and training-application PDFs.
* **Three sanctioned `applications` commands:** `Rejected by Department`
  (pre-join), `Terminated` (from Joined) and `Internship Completed` (from
  Joined). Everything else on `applications` belongs to the Internship Cell
  (TEC).
* Users: coordinators (role `coordinator`), created in Admin. Production URL:
  `https://coordinator.internship.paruluniversity.ac.in`.

## How it connects

* **Scope.** A coordinator sees applications where `assignedDepartment` equals
  their `users.department`. TEC sets that at interview-complete.
* **Training state.**
  * Writing a training **ACTIVE** or **COMPLETED** is the event. TEC's change
    stream advances `applications.status` (Training In Progress / Training
    Completed) and mails the Internship Cell inbox on completion.
  * `ASSIGNED` trainings do not advance anything.
* **Student downloads.** Students download training documents from
  `/api/student/*` with the shared student JWT (`STUDENT_JWT_ACCESS_SECRET`).

## Layout and commands

```
src/      Vite + React 19 SPA (Zustand auth store `pu_rcp_auth`, react-router 7)
server/   CommonJS Express (index.js → routes/ → controllers/ → services/; models/, utils/)
```

```bash
npm ci && npm run dev                   # SPA :5174 — env VITE_API_URL (this backend only)
cd server && npm ci && npm run dev      # API :5001
npm run build                           # → dist/ (Nginx serves it directly)
```

## Key files

| Concern | File |
|---|---|
| Login (email + password, role coordinator), `lastLoginAt` | `server/services/authService.js` |
| Department scoping | `server/utils/identity.js` |
| Training lifecycle and emails | `server/services/trainingService.js` |
| Reject / terminate / complete-internship | `server/controllers/applicationActionController.js` |
| Status shown to the coordinator | `server/utils/mappers.js` (`deriveStatus`) |
| PDFs → `server/storage/documents/` (gitignored) | `server/services/documentService.js` |
| Student-JWT routes | `server/middleware/studentAuth.js`, `server/routes/studentRoutes.js` |
| Email transport (Admin settings → env → Ethereal) | `server/services/email/transporter.js` |

## Gotchas

* **PM2 cluster × 2.** Keep the backend stateless. Rate-limit counts live in
  Mongo `rateLimits`.
* **POSTs need an allowed `Origin`.** `FRONTEND_ORIGINS` includes the Student
  origin for the student routes.
* **`TEC_NOTIFY_EMAIL`** is mailed only on reject and terminate.
  Complete-internship deliberately sends no Internship Cell mail.
* **Session:** `src/lib/apiClient.ts` renews on a 401 and fires
  `pu:session-expired` when it can't. `src/store/authStore.ts` clears the
  saved session, and `src/router/ProtectedRoute.tsx` confirms it with
  `/auth/me` on load and on tab focus. Never trust the localStorage session
  alone.
* **Page data:** load it through `src/hooks/useLiveLoad.ts`, not a bare
  `useEffect`. Otherwise the page never refreshes after other portals change
  the data.
* **Known issue:** `models/Cell.js` is unused (legacy).
* **The attendance-form endpoints exist, but no coordinator page links them**
  (removed from the UI and user guide).
