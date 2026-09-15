# Phase 7 — Study Tracker, Stopwatch and Revision

## Architecture

```text
UI
 ↓
Productivity components
 ↓
useStudyTimer / local UI state
 ↓
StudyService / RevisionService
 ↓
API abstraction
 ↓
Future backend
 ↓
PostgreSQL
```

The authenticated user's ID is supplied by the existing `AuthProvider`. Mock services partition local records by that ID. The future backend must enforce the same ownership server-side.

## StudySession

A study session stores `userId`, optional `subjectId`, `moduleId`, `topicId`, `targetType`, optional `extraTaskLabel`, `durationSeconds`, timestamps, lifecycle `status`, notes, and audit timestamps. Durations are always seconds; timestamps are ISO strings.

## Stopwatch state machine

```text
IDLE → RUNNING → PAUSED → RUNNING → COMPLETED
  └──────────────→ CANCELLED
```

Only one active session is stored for a user. The mock implementation persists the active timer separately from the completed-session history so navigation and refresh can restore it.

## Timing approach

`setInterval` only refreshes the visible clock. The authoritative duration is calculated from real timestamps plus accumulated seconds. Paused time is excluded because `lastStartedAt` is cleared while paused.

## Targets

A session can target a Subject, Module, Topic, or lightweight Extra Learning label. Module and Topic selections are validated against the selected Subject and Module before persistence.

## Study statistics

Completed sessions feed centralized calculations for today, current Monday–Sunday week, total time, completed-session count, average session duration, and time by subject. Cancelled and active sessions are not counted as completed study time.

## RevisionRecord

A revision record belongs to a user and requires a Subject. Module and Topic are optional and relationship-validated. `studySessionId` is optional and can reference one of the user's completed sessions.

## Dashboard integration

Dashboard study-time and completed-session values are read from `studyService.getSummary(user.id)`, avoiding a second calculation path.

## Future PostgreSQL compatibility

The frontend never connects to PostgreSQL. API mode maps study and revision operations to backend endpoints. PostgreSQL can later enforce user ownership, foreign keys, state transitions, and transactions without changing the feature components.
