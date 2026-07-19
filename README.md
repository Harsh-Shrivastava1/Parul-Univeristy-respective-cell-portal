# Parul University — Coordinator (Respective Cell) Portal

The coordinator-facing application of the four-portal Internship Management
System (Student · Coordinator · TEC Cell · Admin), all sharing one MongoDB
database (`parul_internship_system`).

Cell coordinators manage assigned students' **training**: assign mentor/module/
schedule/location, start training, record evaluations, complete training, and
generate the Attendance Form.

- **Frontend:** Vite + React 19 + TypeScript (`src/`)
- **Backend:** Node + Express + Mongoose (`server/`, port 5001)
- **Auth:** JWT in httpOnly cookies

## Status

**Feature-complete and frozen.** No further feature development — only bug
fixes, dependency updates, and maintenance.

## Quick start

```
# Backend
cd server && npm install && cp .env.example .env   # set MONGODB_URI + JWT secrets
npm run dev                                          # http://localhost:5001

# Frontend
cd .. && npm install && npm run dev
```
Coordinator accounts are provisioned by the Admin Portal (users, role
'coordinator', linked to a cell) — there is no self-registration.

## Documentation

| Doc | Contents |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Overview, responsibilities, ownership, flows, folder structure, deployment |
| [docs/API.md](docs/API.md) | Every endpoint: method, route, auth, owner, request/response |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) | Every environment variable |
| [docs/DATABASE.md](docs/DATABASE.md) | Collections, indexes, relationships, event sync |
| [docs/SECURITY.md](docs/SECURITY.md) | Auth, authorization, rate limiting, validation, headers, cookies, audit, residual risks |
| [docs/MAINTENANCE.md](docs/MAINTENANCE.md) | Deferred work, cross-portal assumptions, limitations, technical debt |
