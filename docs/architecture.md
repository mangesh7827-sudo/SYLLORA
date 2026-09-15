# Syllora architecture

```text
React + TypeScript + Vite
        |
        +-- Firebase Authentication
        |     +-- Email/password
        |     +-- Google
        |     +-- Password reset
        |
        +-- Cloud Firestore
        |     +-- Academic data
        |     +-- Attendance
        |     +-- Timetable
        |     +-- Assignments / experiments
        |     +-- Study sessions / revisions
        |     +-- Habits / reminders / notifications
        |     +-- Settings / active timer
        |
        +-- Firebase Storage
        |
        +-- Firestore + Storage Security Rules
        |
        +-- Firebase Hosting
```

There is no custom API server or relational database in the runtime architecture.
