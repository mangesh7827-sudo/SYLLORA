export * from '../types';
export * from '../utils/calculations';
import { createApiAttendanceService, createApiTimetableService, createApiAssignmentService, createApiExperimentService, createApiHabitService } from './apiPhase8';
export const attendanceService = createApiAttendanceService();
export const timetableService = createApiTimetableService();
export const assignmentService = createApiAssignmentService();
export const experimentService = createApiExperimentService();
export const habitService = createApiHabitService();
