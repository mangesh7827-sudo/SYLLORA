# Syllora Phase 8 — Attendance, Timetable, Assignments, Experiments & Habits

Phase 8 extends the authenticated frontend with five user-owned feature domains. Persistence is localStorage-backed in mock mode and each feature has an API-ready service adapter for Phase 9.

## Ownership
- Attendance records/settings belong to a user and reference that user's Subject.
- Timetable and extra lectures carry `userId`; subject references are validated when present.
- Assignments and Experiments carry `userId` and require a valid Subject.
- Habits and HabitRecords carry `userId`; habit records are deleted with their habit.
- API adapters never send a client-controlled ownership query; the future backend must derive ownership from the authenticated session.

## Attendance rules
`percentage = present / total * 100`, with `0%` for zero records. Overall attendance is weighted across lecture counts, never an average of subject percentages. Required attendance is validated to 0–100%. Status is centralized as SAFE, AT_RISK or BELOW_REQUIRED. Recovery projection is calculated centrally and treats a 100% target as unreachable unless already achieved.

## Timetable rules
Weekly entries use Monday-first day numbers 0–6. Time values use `HH:mm`; end must be after start. Extra lectures use a date-specific model and do not mutate the recurring weekly schedule. Today's view combines recurring entries with date-specific extras.

## Assignments
Assignments have PENDING, IN_PROGRESS and COMPLETED states. Completion records `completedAt`; reopening clears it. Due-state calculations distinguish completed, overdue, due today, due soon and upcoming.

## Experiments
Completion and checking are independent. An experiment cannot be checked until completed. Progress reports completed and checked percentages separately.

## Habits
Habits support DAILY/WEEKLY frequency metadata. Today's toggle creates or removes a completion record. Streaks are calculated from actual consecutive completed local dates. Recent history is shown for seven days.

## Service boundaries
`attendanceService`, `timetableService`, `assignmentService`, `experimentService` and `habitService` expose domain operations. Mock services own localStorage persistence and relationship validation; API services define future HTTP contracts. React components do not persist domain data directly.

## Phase 9 boundary
No PostgreSQL, ORM, migrations, server authorization or production backend is introduced in Phase 8.
