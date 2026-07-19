# Coordinator Portal — Architecture & Overview

The Coordinator (Respective Cell) Portal is one of **four independent
applications** (Student, Coordinator, TEC Cell, Admin) sharing **one MongoDB
database** (`parul_internship_system`). Coordinators manage the **training**
lifecycle for students assigned to their cell.

- **Frontend:** Vite + React 19 + TypeScript SPA (`src/`), Zustand auth store.
- **Backend:** Node + Express + Mongoose (CommonJS) in `server/`, port `5001`.
- **Auth:** JWT in httpOnly cookies (`coordinator_access` / `coordinator_refresh`).

## Responsibilities

Coordinator **owns** (writes) only:

| Domain | Collection |
|---|---|
| Trainings, mentor/schedule/module/location, lifecycle status | `trainings` |
| Training evaluation (embedded) | `trainings.evaluation` |
| Attendance Form metadata/reference | `trainings.attendanceForm` |

It **reads** (never writes): `users`/`cells` (coordinator auth + cell scope,
Admin-owned), `students` (Student-owned), `applications` (TEC-owned). It
**appends** to shared `auditLogs` and creates shared `notifications`.

Coordinator **never** owns/writes: applications, advertisements, students,
users, departments, cells, settings.

## Ownership boundary (the law)

> Only the owning backend writes a collection. The Coordinator writes **only**
> `trainings` and emits business events; it **never** writes `applications`.

Application workflow status is projected by the **TEC backend** in response to
training events (the `trainings` document state change is the event, consumed by
TEC's read-time enrichment / workflow service). See [DATABASE.md](./DATABASE.md).

## Flows

**Authentication** → `POST /auth/login` with a cell identifier + password →
matched against an Admin-created coordinator account (`users`, role
'coordinator') by email or via the cell whose `coordinatorId` points to the
user; bcrypt-verified; cell resolved for scoping; JWT cookies issued.
`/auth/refresh` rotates; `/auth/logout` clears. All audited.

**Assigned students** → `GET /me/students` / `GET /me/applications` return the
applications assigned to the coordinator's cell (`applications.assignedCellId`),
joined to `students`, with a coordinator-facing status **derived from the owned
training** (`ASSIGNED` / `TRAINING_ACTIVE` / `TRAINING_COMPLETED`).

**Start training** → `POST /trainings` (assign mentor/module/schedule/location +
start) creates the `trainings` doc `ACTIVE`, emits `TRAINING_STARTED`, notifies
the student. (`POST /trainings/:id/start` starts a pre-existing ASSIGNED training.)

**Evaluation** → `POST /trainings/:id/evaluation` embeds the evaluation and sets
the fields TEC reads for Ready-To-Join (feedback/performance/recommendation/
attendance).

**Complete training** → `POST /trainings/:id/complete` sets `COMPLETED`, emits
`TRAINING_COMPLETED`, notifies the student. TEC projects
`applications.status = Training Completed`.

**Attendance Form** → `POST /trainings/:id/attendance-form` generates the PDF to
disk and stores only a reference on `trainings.attendanceForm`. The student
downloads it through the Student Portal.

## Folder structure

```
Parul-respective-cell-portal/
├── docs/
├── server/                    # backend (Express + Mongoose, CommonJS)
│   ├── config/                # env.js, db.js, logger.js
│   ├── models/                # Training(own) + read: User, Cell, Student,
│   │                          #   Application; shared: Notification, AuditLog
│   ├── controllers/           # auth, student(+applications), training, notification
│   ├── services/              # authService, trainingService, documentService,
│   │                          #   auditService
│   ├── routes/                # auth, me, training, resource, index
│   ├── middleware/            # auth (requireAuth/requireCoordinator), rateLimit,
│   │                          #   errorHandler
│   ├── utils/                 # auth, ApiError, asyncHandler, http, validation,
│   │                          #   identity, mappers
│   └── index.js
└── src/                       # frontend (Vite + React) — UNCHANGED UI
    ├── pages/                 # Login, Dashboard, AssignedStudents, StudentDetail,
    │                          #   StartTraining, Evaluation, Notifications, Profile
    ├── components/ layout/ shared/ ui/
    ├── store/authStore.ts     # Zustand (persisted session)
    ├── lib/apiClient.ts       # fetch client (credentials)
    ├── services/              # thin API clients (auth/student/application/
    │                          #   training/evaluation/notification)
    └── types/index.ts
```

## Local development

```
# Backend
cd server && npm install && cp .env.example .env   # set MONGODB_URI + JWT secrets
npm run dev                                          # http://localhost:5001

# Frontend
cd .. && npm install                                 # optionally VITE_API_URL
npm run dev
```
Coordinator accounts are created by the Admin Portal (users, role
'coordinator', linked to a cell). No self-registration.

## Production deployment
1. Set required env (server refuses to boot without JWT secrets).
2. Configure cookies for the deploy topology (`COOKIE_SAMESITE`).
3. Serve over HTTPS behind a proxy (`trust proxy` enabled).
4. `npm run build` (frontend) + deploy the Node API.

See [API.md](./API.md), [ENVIRONMENT.md](./ENVIRONMENT.md),
[DATABASE.md](./DATABASE.md), [SECURITY.md](./SECURITY.md),
[MAINTENANCE.md](./MAINTENANCE.md).
