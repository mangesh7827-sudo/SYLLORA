/** Development templates. The mock study service materializes these per authenticated user. */
export interface MockStudySessionSeed {
  subjectIndex: number;
  daysAgo: number;
  durationSeconds: number;
}

export const mockStudySessionSeeds: MockStudySessionSeed[] = [
  { subjectIndex: 0, daysAgo: 0, durationSeconds: 5400 },
  { subjectIndex: 1, daysAgo: 1, durationSeconds: 3300 },
  { subjectIndex: 0, daysAgo: 2, durationSeconds: 2700 },
  { subjectIndex: 2, daysAgo: 4, durationSeconds: 4200 },
  { subjectIndex: 3, daysAgo: 6, durationSeconds: 2100 },
];

import type { StudySession } from '@/types';

/** Compatibility export for the Phase 1–6 generic repository surface. */
export const mockStudySessions: StudySession[] = [];
