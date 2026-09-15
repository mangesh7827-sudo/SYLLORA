# Syllora Dashboard Architecture

## Current flow

`Authenticated user → AppLayout → DashboardPage → DashboardDataSource → development mock data`

The dashboard receives the authenticated `User` from `AuthProvider`. Dashboard UI components do not own business logic or hard-code user identity.

## Data boundary

`DashboardDataSource` is the frontend contract. The development implementation reads centralized mock records. The API implementation is prepared through `dashboardApi`, whose backend endpoint is expected to derive ownership from the authenticated server session rather than a client-controlled `userId`.

## Empty-state behavior

New users see useful empty states when subjects, timetable entries, assignments, attendance records, or study sessions do not exist. Mock records are centralized under `src/data/mock` and are never embedded in dashboard components.

## Navigation

Desktop uses a persistent sidebar with grouped navigation and an optional collapsed mode. Tablet uses a compact icon-first sidebar. Mobile uses a touch-friendly drawer with keyboard focus management and Escape-to-close behavior.

## Scope boundary

Phase 5 does not implement subject/module/topic management, study tracking, attendance calculation, timetable management, assignments CRUD, habits, reports, notifications, backend APIs, or PostgreSQL. Those remain in later phases.
