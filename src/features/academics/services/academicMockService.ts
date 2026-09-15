import { localStorageAdapter } from '@/services/storage/storage';
import type { Module, Subject, Topic } from '@/types';
import type { AcademicService, ModuleSummary, SubjectSummary } from '../types/academic';
import { calculateProgress } from '../types/academic';

const STORAGE_KEY = 'syllora:phase6:academic:v1';
const SEEDED_KEY = 'syllora:phase6:seeded-users:v1';

interface Store { subjects: Subject[]; modules: Module[]; topics: Topic[] }

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const readStore = (): Store => localStorageAdapter.get<Store>(STORAGE_KEY) ?? { subjects: [], modules: [], topics: [] };
const writeStore = (store: Store) => localStorageAdapter.set(STORAGE_KEY, store);

function assertText(value: string, label: string) {
  if (!value.trim()) throw new Error(`${label} is required.`);
  if (value.trim().length > 120) throw new Error(`${label} must be 120 characters or fewer.`);
}

function seedForUser(userId: string) {
  const seeded = localStorageAdapter.get<string[]>(SEEDED_KEY) ?? [];
  if (seeded.includes(userId)) return;
  const createdAt = now();
  const subjects: Subject[] = [
    { id: id('subject'), userId, name: 'Java Programming', code: 'JAVA', description: 'Object-oriented programming, collections, exceptions and JDBC.', createdAt, updatedAt: createdAt },
    { id: id('subject'), userId, name: 'Database Systems', code: 'DBMS', description: 'Relational modelling, SQL and database fundamentals.', createdAt, updatedAt: createdAt },
    { id: id('subject'), userId, name: 'Digital Electronics', code: 'DE', description: 'Logic gates, combinational circuits and sequential systems.', createdAt, updatedAt: createdAt },
    { id: id('subject'), userId, name: 'Web Development', code: 'WEB', description: 'Frontend architecture and responsive interface fundamentals.', createdAt, updatedAt: createdAt },
  ];
  const modules: Module[] = [];
  const topics: Topic[] = [];
  const moduleBlueprint = [
    ['Java Programming', ['OOP Fundamentals', 'Collections', 'JDBC']],
    ['Database Systems', ['Relational Model', 'SQL Queries']],
    ['Digital Electronics', ['Number Systems', 'Logic Gates']],
    ['Web Development', ['HTML & CSS', 'Responsive Design']],
  ] as const;
  moduleBlueprint.forEach(([subjectName, moduleNames], subjectIndex) => {
    const subject = subjects.find((item) => item.name === subjectName)!;
    moduleNames.forEach((moduleName, moduleIndex) => {
      const module: Module = { id: id('module'), userId, subjectId: subject.id, name: moduleName, description: `Development module ${moduleIndex + 1}.`, order: moduleIndex + 1, status: 'pending', createdAt, updatedAt: createdAt };
      modules.push(module);
      const topicNames = subjectIndex === 0 && moduleIndex === 0
        ? ['Classes and Objects', 'Inheritance', 'Polymorphism', 'Encapsulation']
        : moduleIndex === 0 ? ['Core concepts', 'Worked examples', 'Practice exercises'] : ['Key concepts', 'Implementation patterns'];
      topicNames.forEach((topicName, topicIndex) => {
        const completed = topicIndex === 0 && subjectIndex < 2;
        topics.push({ id: id('topic'), userId, moduleId: module.id, name: topicName, description: '', order: topicIndex + 1, status: completed ? 'completed' : 'pending', completedAt: completed ? createdAt : undefined, createdAt, updatedAt: createdAt });
      });
    });
  });
  const store = readStore();
  writeStore({ subjects: [...store.subjects, ...subjects], modules: [...store.modules, ...modules], topics: [...store.topics, ...topics] });
  localStorageAdapter.set(SEEDED_KEY, [...seeded, userId]);
}

function getUserStore(userId: string): Store {
  seedForUser(userId);
  const store = readStore();
  return { subjects: store.subjects.filter((x) => x.userId === userId), modules: store.modules.filter((x) => x.userId === userId), topics: store.topics.filter((x) => x.userId === userId) };
}

function persistUserStore(userId: string, userStore: Store) {
  const store = readStore();
  writeStore({ subjects: [...store.subjects.filter((x) => x.userId !== userId), ...userStore.subjects], modules: [...store.modules.filter((x) => x.userId !== userId), ...userStore.modules], topics: [...store.topics.filter((x) => x.userId !== userId), ...userStore.topics] });
}

function subjectSummary(subject: Subject, modules: Module[], topics: Topic[]): SubjectSummary {
  const subjectModules = modules.filter((item) => item.subjectId === subject.id);
  const subjectTopics = topics.filter((topic) => subjectModules.some((module) => module.id === topic.moduleId));
  const completed = subjectTopics.filter((topic) => topic.status === 'completed').length;
  return { ...subject, moduleCount: subjectModules.length, topicCount: subjectTopics.length, completedTopicCount: completed, progress: calculateProgress(completed, subjectTopics.length) };
}

function moduleSummary(module: Module, topics: Topic[]): ModuleSummary {
  const moduleTopics = topics.filter((topic) => topic.moduleId === module.id).sort((a, b) => a.order - b.order);
  const completed = moduleTopics.filter((topic) => topic.status === 'completed').length;
  const status = moduleTopics.length > 0 && completed === moduleTopics.length ? 'completed' : completed > 0 ? 'in_progress' : 'pending';
  return { ...module, status, topicCount: moduleTopics.length, completedTopicCount: completed, progress: calculateProgress(completed, moduleTopics.length) };
}

export function createMockAcademicService(): AcademicService {
  return {
    async getSubjects(userId) { const store = getUserStore(userId); return store.subjects.map((subject) => subjectSummary(subject, store.modules, store.topics)); },
    async getSubject(userId, subjectId) { const store = getUserStore(userId); const subject = store.subjects.find((item) => item.id === subjectId); return subject ? subjectSummary(subject, store.modules, store.topics) : null; },
    async createSubject(userId, input) { assertText(input.name, 'Subject name'); const store = getUserStore(userId); const createdAt = now(); const subject: Subject = { id: id('subject'), userId, name: input.name.trim(), code: input.code?.trim() || undefined, description: input.description?.trim() || undefined, createdAt, updatedAt: createdAt }; persistUserStore(userId, { ...store, subjects: [...store.subjects, subject] }); return subject; },
    async updateSubject(userId, subjectId, input) { assertText(input.name, 'Subject name'); const store = getUserStore(userId); const index = store.subjects.findIndex((item) => item.id === subjectId); if (index < 0) throw new Error('Subject not found.'); const subject = { ...store.subjects[index], name: input.name.trim(), code: input.code?.trim() || undefined, description: input.description?.trim() || undefined, updatedAt: now() }; store.subjects[index] = subject; persistUserStore(userId, store); return subject; },
    async deleteSubject(userId, subjectId) { const store = getUserStore(userId); if (!store.subjects.some((item) => item.id === subjectId)) throw new Error('Subject not found.'); const moduleIds = new Set(store.modules.filter((item) => item.subjectId === subjectId).map((item) => item.id)); persistUserStore(userId, { subjects: store.subjects.filter((item) => item.id !== subjectId), modules: store.modules.filter((item) => item.subjectId !== subjectId), topics: store.topics.filter((item) => !moduleIds.has(item.moduleId)) }); },
    async getModules(userId, subjectId) { const store = getUserStore(userId); if (!store.subjects.some((item) => item.id === subjectId)) return []; return store.modules.filter((item) => item.subjectId === subjectId).sort((a, b) => a.order - b.order).map((item) => moduleSummary(item, store.topics)); },
    async getModule(userId, moduleId) { const store = getUserStore(userId); const module = store.modules.find((item) => item.id === moduleId); return module ? moduleSummary(module, store.topics) : null; },
    async createModule(userId, subjectId, input) { assertText(input.name, 'Module name'); const store = getUserStore(userId); if (!store.subjects.some((item) => item.id === subjectId)) throw new Error('Subject not found.'); const order = input.order ?? Math.max(0, ...store.modules.filter((item) => item.subjectId === subjectId).map((item) => item.order)) + 1; const createdAt = now(); const module: Module = { id: id('module'), userId, subjectId, name: input.name.trim(), description: input.description?.trim() || undefined, order, status: 'pending', createdAt, updatedAt: createdAt }; persistUserStore(userId, { ...store, modules: [...store.modules, module] }); return module; },
    async updateModule(userId, moduleId, input) { assertText(input.name, 'Module name'); const store = getUserStore(userId); const index = store.modules.findIndex((item) => item.id === moduleId); if (index < 0) throw new Error('Module not found.'); const module = { ...store.modules[index], name: input.name.trim(), description: input.description?.trim() || undefined, order: input.order ?? store.modules[index].order, updatedAt: now() }; store.modules[index] = module; persistUserStore(userId, store); return module; },
    async deleteModule(userId, moduleId) { const store = getUserStore(userId); if (!store.modules.some((item) => item.id === moduleId)) throw new Error('Module not found.'); persistUserStore(userId, { ...store, modules: store.modules.filter((item) => item.id !== moduleId), topics: store.topics.filter((item) => item.moduleId !== moduleId) }); },
    async getTopics(userId, moduleId) { const store = getUserStore(userId); return store.topics.filter((item) => item.moduleId === moduleId).sort((a, b) => a.order - b.order); },
    async getTopic(userId, topicId) { const store = getUserStore(userId); return store.topics.find((item) => item.id === topicId) ?? null; },
    async createTopic(userId, moduleId, input) { assertText(input.name, 'Topic name'); const store = getUserStore(userId); const module = store.modules.find((item) => item.id === moduleId); if (!module) throw new Error('Module not found.'); const order = input.order ?? Math.max(0, ...store.topics.filter((item) => item.moduleId === moduleId).map((item) => item.order)) + 1; const status = input.status === 'completed' ? 'completed' : 'pending'; const createdAt = now(); const topic: Topic = { id: id('topic'), userId, moduleId, name: input.name.trim(), description: input.description?.trim() || undefined, order, status, completedAt: status === 'completed' ? createdAt : undefined, createdAt, updatedAt: createdAt }; persistUserStore(userId, { ...store, topics: [...store.topics, topic] }); return topic; },
    async updateTopic(userId, topicId, input) { assertText(input.name, 'Topic name'); const store = getUserStore(userId); const index = store.topics.findIndex((item) => item.id === topicId); if (index < 0) throw new Error('Topic not found.'); const previous = store.topics[index]; const status = input.status ?? previous.status; const updatedAt = now(); const topic = { ...previous, name: input.name.trim(), description: input.description?.trim() || undefined, order: input.order ?? previous.order, status, completedAt: status === 'completed' ? previous.completedAt ?? updatedAt : undefined, updatedAt }; store.topics[index] = topic; persistUserStore(userId, store); return topic; },
    async deleteTopic(userId, topicId) { const store = getUserStore(userId); if (!store.topics.some((item) => item.id === topicId)) throw new Error('Topic not found.'); persistUserStore(userId, { ...store, topics: store.topics.filter((item) => item.id !== topicId) }); },
    async setTopicStatus(userId, topicId, status) { const topic = await this.getTopic(userId, topicId); if (!topic) throw new Error('Topic not found.'); return this.updateTopic(userId, topicId, { name: topic.name, description: topic.description, order: topic.order, status }); },
    async getOverallProgress(userId) { const store = getUserStore(userId); const completed = store.topics.filter((item) => item.status === 'completed').length; return { totalSubjects: store.subjects.length, totalModules: store.modules.length, totalTopics: store.topics.length, completedTopics: completed, pendingTopics: store.topics.length - completed, overallPercentage: calculateProgress(completed, store.topics.length) }; },
  };
}
