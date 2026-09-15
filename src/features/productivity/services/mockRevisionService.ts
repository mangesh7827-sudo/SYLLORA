import { academicService } from '@/features/academics/services/academicService';
import { mockRevisionSeed } from '@/data/mock/revisions';
import { studyService } from './studyService';
import { localStorageAdapter } from '@/services/storage/storage';
import type { ID, RevisionRecord } from '@/types';
import type { RevisionInput, RevisionService } from '../types/productivity';

const KEY = 'syllora:phase7:revisions:v1';
const SEEDED_KEY = 'syllora:phase7:revisions-seeded-users:v1';
const now = () => new Date().toISOString();
const makeId = () => `revision-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const read = (): RevisionRecord[] => localStorageAdapter.get<RevisionRecord[]>(KEY) ?? [];
const write = (records: RevisionRecord[]) => localStorageAdapter.set(KEY, records);

async function validate(userId: ID, input: RevisionInput) {
  if (!input.subjectId) throw new Error('Select a subject.');
  const subject = await academicService.getSubject(userId, input.subjectId); if (!subject) throw new Error('The selected subject is unavailable.');
  if (input.moduleId) { const module = await academicService.getModule(userId, input.moduleId); if (!module || module.subjectId !== subject.id) throw new Error('The selected module does not belong to this subject.');
    if (input.topicId) { const topics = await academicService.getTopics(userId, module.id); if (!topics.some((topic) => topic.id === input.topicId)) throw new Error('The selected topic does not belong to this module.'); }
  } else if (input.topicId) throw new Error('Select the topic’s module first.');
  if (!Number.isFinite(Date.parse(input.revisedAt))) throw new Error('Enter a valid revision date and time.');
  if (input.studySessionId) { const sessions = await studyService.getSessions(userId); if (!sessions.some((session) => session.id === input.studySessionId)) throw new Error('The linked study session is unavailable.'); }
}

async function seed(userId: ID) {
  const seeded = localStorageAdapter.get<ID[]>(SEEDED_KEY) ?? []; if (seeded.includes(userId)) return;
  const subjects = await academicService.getSubjects(userId); if (!subjects.length) return;
  const subject = subjects[mockRevisionSeed.subjectIndex] ?? subjects[0]; const modules = await academicService.getModules(userId, subject.id); const module = modules[mockRevisionSeed.moduleIndex] ?? modules[0]; const topics = module ? await academicService.getTopics(userId, module.id) : [];
  const revisedAt = new Date(); revisedAt.setDate(revisedAt.getDate() - 1); revisedAt.setHours(18, 0, 0, 0);
  const record: RevisionRecord = { id: makeId(), userId, subjectId: subject.id, moduleId: module?.id, topicId: topics[mockRevisionSeed.topicIndex]?.id, revisedAt: revisedAt.toISOString(), notes: 'Seeded revision record for development.', createdAt: revisedAt.toISOString(), updatedAt: revisedAt.toISOString() };
  write([...read().filter((item) => item.userId !== userId), record]); localStorageAdapter.set(SEEDED_KEY, [...seeded, userId]);
}

export function createMockRevisionService(): RevisionService {
  return {
    async createRevision(userId, input) { await seed(userId); await validate(userId, input); const timestamp = now(); const record: RevisionRecord = { id: makeId(), userId, subjectId: input.subjectId, moduleId: input.moduleId, topicId: input.topicId, revisedAt: input.revisedAt, notes: input.notes?.trim() || undefined, studySessionId: input.studySessionId, createdAt: timestamp, updatedAt: timestamp }; write([...read(), record]); return record; },
    async updateRevision(userId, revisionId, input) { await validate(userId, input); const records = read(); const index = records.findIndex((item) => item.userId === userId && item.id === revisionId); if (index < 0) throw new Error('Revision record not found.'); const updated = { ...records[index], subjectId: input.subjectId, moduleId: input.moduleId, topicId: input.topicId, revisedAt: input.revisedAt, notes: input.notes?.trim() || undefined, studySessionId: input.studySessionId, updatedAt: now() }; records[index] = updated; write(records); return updated; },
    async deleteRevision(userId, revisionId) { const records = read(); if (!records.some((item) => item.userId === userId && item.id === revisionId)) throw new Error('Revision record not found.'); write(records.filter((item) => !(item.userId === userId && item.id === revisionId))); },
    async getRevisions(userId) { await seed(userId); return read().filter((item) => item.userId === userId).sort((a, b) => b.revisedAt.localeCompare(a.revisedAt)); },
  };
}
