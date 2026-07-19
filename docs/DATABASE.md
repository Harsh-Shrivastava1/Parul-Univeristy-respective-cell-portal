# Coordinator Portal — Database

Shared database `parul_internship_system`. The Coordinator Portal owns and writes
**only `trainings`**.

## Collections

| Collection | Access | Owner |
|---|---|---|
| `trainings` | **read + write** | Coordinator |
| `users` | read (coordinator auth) | Admin |
| `cells` | read (resolve coordinator's cell) | Admin |
| `students` | read (assigned-student details) | Student |
| `applications` | read (cell-assigned; status derived from training) | TEC |
| `notifications` | create + cell-scoped read/mark | shared |
| `auditLogs` | append | shared (Admin-governed) |

## `trainings` document

`id` (unique), `trainingId`, `applicationId`, `studentId`, `assignedCellId`,
`mentorName`, `companySupervisor`, `trainingModule`, `reportingLocation`,
`joiningDate`/`startDate`, `reportingTime`, `duration`, `status`
(`ASSIGNED|ACTIVE|COMPLETED`), `startedAt`, `completedAt`, `evaluation{}` (embedded),
`feedback`/`performance`/`remarks`/`recommendation`/`attendance` (fields the TEC
backend reads to gate Ready-To-Join), `attendanceForm{}` (reference/metadata only),
`createdAt`, `updatedAt`.

## Indexes (`server/models/Training.js`)

| Field | Type |
|---|---|
| `id` | unique |
| `trainingId`, `applicationId`, `studentId`, `assignedCellId`, `status` | index |
| `{ assignedCellId, status }` | compound |

## Relationships

- `trainings.applicationId` → `applications.id` (1:1).
- `trainings.studentId` → the student.
- `trainings.assignedCellId` → the cell (matched against the coordinator's
  resolved cell keys).
- Coordinator ↔ cell: `cells.coordinatorId` → `users.id` (role coordinator).

## Transactions

Training writes are single-document updates (atomic by default in MongoDB); no
multi-document transaction is required.

## Event synchronization (cross-portal)

The Coordinator writes `trainings.status` and **emits a business event**
(`TRAINING_STARTED` / `TRAINING_COMPLETED`, recorded in `auditLogs`). The
`trainings` document state change is the **event transport**: the TEC backend
projects it onto `applications.status` (`Training In Progress` / `Training
Completed`) via read-time enrichment / its workflow service. **The Coordinator
never writes `applications`.** The coordinator-facing application status shown in
this portal is derived locally from the owned training (`utils/mappers.js`).
