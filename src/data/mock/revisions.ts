/** Development templates are materialized per authenticated user by the Phase 7 revision service. */
export const mockRevisionSeed = { subjectIndex: 0, moduleIndex: 0, topicIndex: 0, daysAgo: 1 };

import type { RevisionRecord } from '@/types';

/** Compatibility export for the Phase 1–6 generic repository surface. */
export const mockRevisions: RevisionRecord[] = [];
