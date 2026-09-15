# Phase 6 — Academic hierarchy

Syllora's Phase 6 hierarchy is **User → Subject → Module → Topic**. The UI never owns CRUD persistence directly; pages call `academicService`, which selects either the development mock service or a future backend adapter based on the existing API mode.

## Progress source of truth

Progress is derived from topic completion counts:

- Module: completed topics / total topics × 100.
- Subject: completed topics across every module / total topics across every module × 100.
- Overall: completed topics across every subject / total topics × 100.

Zero topics always produce `0%`. Values are stored/calculated with one decimal place and formatted without unnecessary trailing zeroes.

## Development persistence

Mock academic data is stored in localStorage and partitioned by authenticated `userId`. A first-time development user receives a realistic sample hierarchy so the UI can be exercised. This is a development-only source and is not a backend authorization boundary.

## Backend boundary

`src/services/api/academic.ts` defines the Phase 9-compatible API contract. The future backend must derive ownership from the authenticated server session rather than trusting a client-provided `userId`.

## Deletion

The mock service currently removes descendants when a parent is deleted so the development behavior matches the intended cascade contract. The eventual database/backend remains authoritative for cascade/restrict/transaction semantics.
