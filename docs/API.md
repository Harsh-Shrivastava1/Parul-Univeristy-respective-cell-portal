# Coordinator Portal — API Reference

Base URL: `VITE_API_URL` (default `http://localhost:5001/api`). Responses use the
envelope `{ success, data?, error? }`. Auth via the httpOnly `coordinator_access`
cookie (sent with `credentials: 'include'`). Errors: **400** validation, **401**
unauthenticated/expired, **403** wrong role / not your cell, **404** not found,
**409** conflict, **429** rate limited, **500** internal.

All non-auth routes require an authenticated **coordinator** and are **scoped to
the coordinator's cell**.

## Auth

| Method | Route | Auth | Purpose | Request | Response |
|---|---|---|---|---|---|
| POST | `/auth/login` | public (rate-limited) | Login | `{cellId, password}` | `{data: AuthSession}` |
| POST | `/auth/refresh` | refresh cookie | Rotate tokens | — | `{data: AuthSession}` |
| GET | `/auth/me` | coordinator | Current session | — | `{data: AuthSession}` |
| POST | `/auth/logout` | coordinator | Clear session | — | `{success}` |

## Assigned students & applications (read gateway)

| Method | Route | Owner | Purpose | Response |
|---|---|---|---|---|
| GET | `/me/students` | Student (read) | Students assigned to the cell | `{data: Student[]}` |
| GET | `/students/:studentId` | Student (read) | One assigned student | `{data: Student}` |
| GET | `/me/applications` | TEC (read) | Cell applications (status derived from training) | `{data: Application[]}` |
| GET | `/applications/:id` | TEC (read) | One cell application | `{data: Application}` |

## Trainings (Coordinator-owned)

| Method | Route | Purpose | Request | Response |
|---|---|---|---|---|
| GET | `/me/trainings` | Cell trainings | — | `{data: Training[]}` |
| GET | `/trainings/:id` | One training | — | `{data: Training}` |
| POST | `/trainings` | Create + start (assign mentor/schedule) | `StartTrainingPayload` | `201 {data: Training}` |
| PATCH | `/trainings/:id` | Update mentor/schedule/module/location | partial training fields | `{data: Training}` |
| POST | `/trainings/:id/start` | Start a pre-existing ASSIGNED training | — | `{data: Training}` |
| POST | `/trainings/:id/complete` | Complete training → emits event | — | `{data: Training}` |
| POST | `/trainings/:id/evaluation` | Submit evaluation | `{communication, technicalSkills, punctuality, overallPerformance, remarks}` | `201 {data: Evaluation}` |
| GET | `/me/evaluations` | Cell evaluations | — | `{data: Evaluation[]}` |
| POST | `/trainings/:id/attendance-form` | Generate Attendance Form (stores ref) | — | `201 {data:{fileName, generatedAt}}` |
| GET | `/trainings/:id/attendance-form` | Download Attendance Form PDF | — | `application/pdf` |

## Notifications (shared collection, cell-scoped)

| Method | Route | Purpose |
|---|---|---|
| GET | `/me/notifications` | Cell notification feed |
| PATCH | `/notifications/read-all` | Mark all cell notifications read |
| PATCH | `/notifications/:id/read` | Mark one read |

## Health

| Method | Route | Auth |
|---|---|---|
| GET | `/api/health` | public |
