import { createMockRepository } from '@/services/repositories';
import {
  mockAssignments,
  mockAttendance,
  mockExperiments,
  mockHabits,
  mockModules,
  mockProjects,
  mockReminders,
  mockRevisions,
  mockStudySessions,
  mockSubjects,
  mockTimetable,
  mockTopics,
  mockNotifications,
  mockReports,
} from '@/data/mock';

export const mockRepositories = {
  subjects: createMockRepository(mockSubjects),
  modules: createMockRepository(mockModules),
  topics: createMockRepository(mockTopics),
  studySessions: createMockRepository(mockStudySessions),
  revisions: createMockRepository(mockRevisions),
  attendance: createMockRepository(mockAttendance),
  timetable: createMockRepository(mockTimetable),
  assignments: createMockRepository(mockAssignments),
  experiments: createMockRepository(mockExperiments),
  projects: createMockRepository(mockProjects),
  habits: createMockRepository(mockHabits),
  reminders: createMockRepository(mockReminders),
  notifications: createMockRepository(mockNotifications),
  reports: createMockRepository(mockReports),
} as const;
