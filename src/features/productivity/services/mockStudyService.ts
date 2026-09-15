import { academicService } from '@/features/academics/services/academicService';
import { mockStudySessionSeeds } from '@/data/mock/studySessions';
import { localStorageAdapter } from '@/services/storage/storage';
import type { ID, StudySession } from '@/types';
import type { ActiveTimerState, StudyService, StudySessionInput, StudySummary } from '../types/productivity';
import { getElapsedSeconds, isSessionInCurrentWeek, isSessionOnLocalDay } from '../utils/time';

const SESSIONS_KEY = 'syllora:phase7:study-sessions:v1';
const ACTIVE_KEY = 'syllora:phase7:active-timer:v1';
const SEEDED_KEY = 'syllora:phase7:seeded-users:v1';

type Store = { sessions: StudySession[]; active: ActiveTimerState[] };
const now = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const readStore = (): Store => localStorageAdapter.get<Store>(SESSIONS_KEY) ?? { sessions: [], active: [] };
const writeStore = (store: Store) => localStorageAdapter.set(SESSIONS_KEY, store);
const readActive = (): ActiveTimerState[] => localStorageAdapter.get<ActiveTimerState[]>(ACTIVE_KEY) ?? [];
const writeActive = (active: ActiveTimerState[]) => localStorageAdapter.set(ACTIVE_KEY, active);

function cleanText(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 500) : undefined;
}

function assertTarget(input: StudySessionInput) {
  if (input.targetType === 'SUBJECT' && !input.subjectId) throw new Error('Select a subject before starting study.');
  if (input.targetType === 'MODULE' && (!input.subjectId || !input.moduleId)) throw new Error('Select a subject and module before starting study.');
  if (input.targetType === 'TOPIC' && (!input.subjectId || !input.moduleId || !input.topicId)) throw new Error('Select a subject, module and topic before starting study.');
  if (input.targetType === 'EXTRA_TASK' && !cleanText(input.extraTaskLabel)) throw new Error('Enter an extra learning task name.');
}

async function validateAcademicTarget(userId: ID, input: StudySessionInput) {
  assertTarget(input);
  if (input.targetType === 'EXTRA_TASK') return;
  const subject = input.subjectId ? await academicService.getSubject(userId, input.subjectId) : null;
  if (!subject) throw new Error('The selected subject is unavailable.');
  if (input.targetType === 'SUBJECT') return;
  const module = input.moduleId ? await academicService.getModule(userId, input.moduleId) : null;
  if (!module || module.subjectId !== subject.id) throw new Error('The selected module does not belong to this subject.');
  if (input.targetType === 'MODULE') return;
  const topics = await academicService.getTopics(userId, module.id);
  if (!input.topicId || !topics.some((topic) => topic.id === input.topicId)) throw new Error('The selected topic does not belong to this module.');
}

async function seedForUser(userId: ID) {
  const seeded = localStorageAdapter.get<ID[]>(SEEDED_KEY) ?? [];
  if (seeded.includes(userId)) return;
  const subjects = await academicService.getSubjects(userId);
  if (subjects.length === 0) return;
  const modules = await Promise.all(subjects.slice(0, 4).map((subject) => academicService.getModules(userId, subject.id)));
  const makeSession = (subjectIndex: number, daysAgo: number, durationSeconds: number, topicIndex = 0): StudySession => {
    const subject = subjects[subjectIndex % subjects.length];
    const subjectModules = modules[subjectIndex % modules.length];
    const module = subjectModules[0];
    const started = new Date();
    started.setDate(started.getDate() - daysAgo);
    started.setHours(17 + (subjectIndex % 2), 15, 0, 0);
    const ended = new Date(started.getTime() + durationSeconds * 1000);
    return {
      id: makeId('study'), userId, subjectId: subject.id, moduleId: module?.id,
      targetType: module ? 'MODULE' : 'SUBJECT', durationSeconds,
      startedAt: started.toISOString(), endedAt: ended.toISOString(), status: 'COMPLETED',
      notes: topicIndex === 0 ? 'Seeded study session for development.' : undefined,
      createdAt: started.toISOString(), updatedAt: ended.toISOString(),
    };
  };
  const sessions = mockStudySessionSeeds.map((seed) => makeSession(seed.subjectIndex, seed.daysAgo, seed.durationSeconds));
  const store = readStore();
  writeStore({ sessions: [...store.sessions.filter((session) => session.userId !== userId), ...sessions], active: readActive().filter((item) => item.userId !== userId) });
  localStorageAdapter.set(SEEDED_KEY, [...seeded, userId]);
}

function getUserSessions(userId: ID): StudySession[] {
  return readStore().sessions.filter((session) => session.userId === userId);
}

function persistUserSessions(userId: ID, sessions: StudySession[]) {
  const store = readStore();
  writeStore({ sessions: [...store.sessions.filter((session) => session.userId !== userId), ...sessions], active: readActive() });
}

function getUserActive(userId: ID): ActiveTimerState | null {
  return readActive().find((item) => item.userId === userId) ?? null;
}

function persistUserActive(userId: ID, next: ActiveTimerState | null) {
  const active = readActive().filter((item) => item.userId !== userId);
  if (next) active.push(next);
  writeActive(active);
}

function getSessionOrThrow(userId: ID, sessionId: ID, sessions = getUserSessions(userId)): StudySession {
  const session = sessions.find((item) => item.id === sessionId);
  if (!session) throw new Error('Study session not found.');
  return session;
}

function withElapsed(session: StudySession, active: ActiveTimerState | null): StudySession {
  if (!active || active.sessionId !== session.id) return session;
  return { ...session, durationSeconds: getElapsedSeconds(active.accumulatedSeconds, active.lastStartedAt) };
}

export function createMockStudyService(): StudyService {
  return {
    async startSession(userId, input) {
      await seedForUser(userId);
      if (getUserActive(userId)) throw new Error('A study session is already running. Finish or cancel it before starting another.');
      await validateAcademicTarget(userId, input);
      const timestamp = now();
      const session: StudySession = { id: makeId('study'), userId, subjectId: input.subjectId, moduleId: input.moduleId, topicId: input.topicId, targetType: input.targetType, extraTaskLabel: cleanText(input.extraTaskLabel), startedAt: timestamp, durationSeconds: 0, status: 'RUNNING', notes: cleanText(input.notes), createdAt: timestamp, updatedAt: timestamp };
      persistUserSessions(userId, [...getUserSessions(userId), session]);
      persistUserActive(userId, { sessionId: session.id, userId, status: 'RUNNING', accumulatedSeconds: 0, lastStartedAt: timestamp, updatedAt: timestamp });
      return session;
    },
    async pauseSession(userId, sessionId) {
      const active = getUserActive(userId); if (!active || active.sessionId !== sessionId || active.status !== 'RUNNING') throw new Error('The study session is not running.');
      const sessions = getUserSessions(userId); const index = sessions.findIndex((item) => item.id === sessionId); if (index < 0) throw new Error('Study session not found.');
      const duration = getElapsedSeconds(active.accumulatedSeconds, active.lastStartedAt); const timestamp = now();
      const session = { ...sessions[index], durationSeconds: duration, status: 'PAUSED' as const, updatedAt: timestamp };
      sessions[index] = session; persistUserSessions(userId, sessions); persistUserActive(userId, { ...active, status: 'PAUSED', accumulatedSeconds: duration, lastStartedAt: null, updatedAt: timestamp }); return session;
    },
    async resumeSession(userId, sessionId) {
      const active = getUserActive(userId); if (!active || active.sessionId !== sessionId || active.status !== 'PAUSED') throw new Error('The study session is not paused.');
      const sessions = getUserSessions(userId); const index = sessions.findIndex((item) => item.id === sessionId); if (index < 0) throw new Error('Study session not found.');
      const timestamp = now(); const session = { ...sessions[index], status: 'RUNNING' as const, updatedAt: timestamp }; sessions[index] = session; persistUserSessions(userId, sessions); persistUserActive(userId, { ...active, status: 'RUNNING', lastStartedAt: timestamp, updatedAt: timestamp }); return session;
    },
    async completeSession(userId, sessionId, input = {}) {
      const active = getUserActive(userId); const sessions = getUserSessions(userId); const index = sessions.findIndex((item) => item.id === sessionId); if (index < 0) throw new Error('Study session not found.');
      const current = sessions[index];
      if (current.status === 'COMPLETED' || current.status === 'CANCELLED') throw new Error('This study session is already closed.');
      const duration = active?.sessionId === sessionId ? getElapsedSeconds(active.accumulatedSeconds, active.lastStartedAt) : current.durationSeconds;
      const merged: StudySessionInput = { targetType: input.targetType ?? current.targetType, subjectId: input.subjectId ?? current.subjectId, moduleId: input.moduleId ?? current.moduleId, topicId: input.topicId ?? current.topicId, extraTaskLabel: input.extraTaskLabel ?? current.extraTaskLabel, notes: input.notes ?? current.notes };
      await validateAcademicTarget(userId, merged);
      const timestamp = now(); const session = { ...current, ...merged, extraTaskLabel: cleanText(merged.extraTaskLabel), notes: cleanText(merged.notes), durationSeconds: duration, status: 'COMPLETED' as const, endedAt: timestamp, updatedAt: timestamp };
      sessions[index] = session; persistUserSessions(userId, sessions); if (active?.sessionId === sessionId) persistUserActive(userId, null); return session;
    },
    async cancelSession(userId, sessionId) {
      const active = getUserActive(userId); const sessions = getUserSessions(userId); const index = sessions.findIndex((item) => item.id === sessionId); if (index < 0) throw new Error('Study session not found.');
      const current = sessions[index]; if (current.status === 'COMPLETED' || current.status === 'CANCELLED') throw new Error('This study session is already closed.');
      const timestamp = now(); const session = { ...current, status: 'CANCELLED' as const, endedAt: timestamp, updatedAt: timestamp, durationSeconds: active?.sessionId === sessionId ? getElapsedSeconds(active.accumulatedSeconds, active.lastStartedAt) : current.durationSeconds }; sessions[index] = session; persistUserSessions(userId, sessions); if (active?.sessionId === sessionId) persistUserActive(userId, null); return session;
    },
    async getActiveSession(userId) {
      await seedForUser(userId); const active = getUserActive(userId); if (!active) return null; const session = getUserSessions(userId).find((item) => item.id === active.sessionId); return session ? withElapsed(session, active) : null;
    },
    async getActiveTimer(userId) { await seedForUser(userId); return getUserActive(userId); },
    async getElapsedSeconds(userId, sessionId, nowMs = Date.now()) { const active = getUserActive(userId); if (!active || active.sessionId !== sessionId) return getSessionOrThrow(userId, sessionId).durationSeconds; return getElapsedSeconds(active.accumulatedSeconds, active.lastStartedAt, nowMs); },
    async getSessions(userId) { await seedForUser(userId); return getUserSessions(userId).filter((session) => session.status === 'COMPLETED').sort((a, b) => b.startedAt.localeCompare(a.startedAt)); },
    async updateSession(userId, sessionId, input) {
      const sessions = getUserSessions(userId); const index = sessions.findIndex((item) => item.id === sessionId); if (index < 0) throw new Error('Study session not found.');
      const current = sessions[index]; if (current.status === 'RUNNING' || current.status === 'PAUSED') throw new Error('Stop the active timer before editing this session.');
      const merged: StudySessionInput = { targetType: input.targetType ?? current.targetType, subjectId: input.subjectId ?? current.subjectId, moduleId: input.moduleId ?? current.moduleId, topicId: input.topicId ?? current.topicId, extraTaskLabel: input.extraTaskLabel ?? current.extraTaskLabel, notes: input.notes ?? current.notes }; await validateAcademicTarget(userId, merged); const updated = { ...current, ...merged, extraTaskLabel: cleanText(merged.extraTaskLabel), notes: cleanText(merged.notes), updatedAt: now() }; sessions[index] = updated; persistUserSessions(userId, sessions); return updated;
    },
    async deleteSession(userId, sessionId) { const sessions = getUserSessions(userId); const session = getSessionOrThrow(userId, sessionId, sessions); if (session.status === 'RUNNING' || session.status === 'PAUSED') throw new Error('Stop or cancel the active timer before deleting it.'); persistUserSessions(userId, sessions.filter((item) => item.id !== sessionId)); },
    async getSummary(userId, date = new Date()): Promise<StudySummary> {
      const sessions = await this.getSessions(userId); const totalSeconds = sessions.reduce((sum, item) => sum + item.durationSeconds, 0); const todaySeconds = sessions.filter((item) => isSessionOnLocalDay(item, date)).reduce((sum, item) => sum + item.durationSeconds, 0); const weekSeconds = sessions.filter((item) => isSessionInCurrentWeek(item, date)).reduce((sum, item) => sum + item.durationSeconds, 0); return { todaySeconds, weekSeconds, totalSeconds, completedSessions: sessions.length, averageSessionSeconds: sessions.length ? Math.round(totalSeconds / sessions.length) : 0 };
    },
    async getStudyTimeBySubject(userId) { const sessions = await this.getSessions(userId); const map = new Map<ID, number>(); sessions.forEach((session) => { if (session.subjectId) map.set(session.subjectId, (map.get(session.subjectId) ?? 0) + session.durationSeconds); }); return [...map.entries()].map(([subjectId, seconds]) => ({ subjectId, seconds })).sort((a, b) => b.seconds - a.seconds); },
  };
}
