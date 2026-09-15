import type { ID, ISODateTime, StudySession, StudySessionStatus, StudyTargetType } from '@/types';

export type { StudyTargetType } from '@/types';

export interface StudySessionInput {
  subjectId?: ID;
  moduleId?: ID;
  topicId?: ID;
  targetType: StudyTargetType;
  extraTaskLabel?: string;
  notes?: string;
}

export interface ActiveTimerState {
  sessionId: ID;
  userId: ID;
  status: Extract<StudySessionStatus, 'RUNNING' | 'PAUSED'>;
  accumulatedSeconds: number;
  lastStartedAt: ISODateTime | null;
  updatedAt: ISODateTime;
}

export interface StudySummary {
  todaySeconds: number;
  weekSeconds: number;
  totalSeconds: number;
  completedSessions: number;
  averageSessionSeconds: number;
}

export interface SubjectStudyTime {
  subjectId: ID;
  seconds: number;
}

export interface StudyService {
  startSession(userId: ID, input: StudySessionInput): Promise<StudySession>;
  pauseSession(userId: ID, sessionId: ID): Promise<StudySession>;
  resumeSession(userId: ID, sessionId: ID): Promise<StudySession>;
  completeSession(userId: ID, sessionId: ID, input?: Partial<StudySessionInput>): Promise<StudySession>;
  cancelSession(userId: ID, sessionId: ID): Promise<StudySession>;
  getActiveSession(userId: ID): Promise<StudySession | null>;
  getActiveTimer(userId: ID): Promise<ActiveTimerState | null>;
  getElapsedSeconds(userId: ID, sessionId: ID, nowMs?: number): Promise<number>;
  getSessions(userId: ID): Promise<StudySession[]>;
  updateSession(userId: ID, sessionId: ID, input: Partial<StudySessionInput>): Promise<StudySession>;
  deleteSession(userId: ID, sessionId: ID): Promise<void>;
  getSummary(userId: ID, now?: Date): Promise<StudySummary>;
  getStudyTimeBySubject(userId: ID): Promise<SubjectStudyTime[]>;
}

export interface RevisionInput {
  subjectId: ID;
  moduleId?: ID;
  topicId?: ID;
  revisedAt: ISODateTime;
  notes?: string;
  studySessionId?: ID;
}

export interface RevisionService {
  createRevision(userId: ID, input: RevisionInput): Promise<import('@/types').RevisionRecord>;
  updateRevision(userId: ID, revisionId: ID, input: RevisionInput): Promise<import('@/types').RevisionRecord>;
  deleteRevision(userId: ID, revisionId: ID): Promise<void>;
  getRevisions(userId: ID): Promise<import('@/types').RevisionRecord[]>;
}

export type StudySessionWithTarget = StudySession & { targetLabel: string; subjectName?: string; moduleName?: string; topicName?: string };
