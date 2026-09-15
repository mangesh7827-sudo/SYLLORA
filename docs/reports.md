# Syllora Reports

Reports are derived from authenticated PostgreSQL data through the backend report service. The `/reports` API accepts optional `from`, `to`, `subjectId`, and `moduleId` filters. Academic progress is topic-weighted and attendance has a zero-record guard.

The UI supports period/subject filters, responsive progress visualizations, browser print-to-PDF, and authenticated attendance CSV export. Exports are scoped by the server-side session user.
