import type { Module, Subject, Topic } from '@/types';

export interface AcademicProgress {
  totalSubjects: number;
  totalModules: number;
  totalTopics: number;
  completedTopics: number;
  pendingTopics: number;
  overallPercentage: number;
}

export interface SubjectSummary extends Subject {
  moduleCount: number;
  topicCount: number;
  completedTopicCount: number;
  progress: number;
}

export interface ModuleSummary extends Module {
  topicCount: number;
  completedTopicCount: number;
  progress: number;
}

export interface SubjectInput {
  name: string;
  code?: string;
  description?: string;
}

export interface ModuleInput {
  name: string;
  description?: string;
  order?: number;
}

export interface TopicInput {
  name: string;
  description?: string;
  order?: number;
  status?: 'pending' | 'completed';
}

export type AcademicErrorCode = 'not_found' | 'validation' | 'conflict' | 'network' | 'unknown';

export interface AcademicService {
  getSubjects(userId: string): Promise<SubjectSummary[]>;
  getSubject(userId: string, subjectId: string): Promise<SubjectSummary | null>;
  createSubject(userId: string, input: SubjectInput): Promise<Subject>;
  updateSubject(userId: string, subjectId: string, input: SubjectInput): Promise<Subject>;
  deleteSubject(userId: string, subjectId: string): Promise<void>;

  getModules(userId: string, subjectId: string): Promise<ModuleSummary[]>;
  getModule(userId: string, moduleId: string): Promise<ModuleSummary | null>;
  createModule(userId: string, subjectId: string, input: ModuleInput): Promise<Module>;
  updateModule(userId: string, moduleId: string, input: ModuleInput): Promise<Module>;
  deleteModule(userId: string, moduleId: string): Promise<void>;

  getTopics(userId: string, moduleId: string): Promise<Topic[]>;
  getTopic(userId: string, topicId: string): Promise<Topic | null>;
  createTopic(userId: string, moduleId: string, input: TopicInput): Promise<Topic>;
  updateTopic(userId: string, topicId: string, input: TopicInput): Promise<Topic>;
  deleteTopic(userId: string, topicId: string): Promise<void>;
  setTopicStatus(userId: string, topicId: string, status: 'pending' | 'completed'): Promise<Topic>;

  getOverallProgress(userId: string): Promise<AcademicProgress>;
}

export function calculateProgress(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Number(((completed / total) * 100).toFixed(1));
}

export function formatProgress(value: number): string {
  const normalized = Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
  return `${normalized}%`;
}
