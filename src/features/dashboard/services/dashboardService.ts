import { mockAssignments, mockAttendance, mockSubjects, mockStudySessions, mockTimetable } from '@/data/mock';
import { academicService } from '@/features/academics/services/academicService';
import { studyService } from '@/features/productivity/services/studyService';
import { attendanceService, assignmentService, experimentService, habitService, timetableService } from '@/features/phase8/services';
import { assignmentDueState } from '@/features/phase8/utils/calculations';
import { formatTime } from '@/features/phase8/utils/date';
import type { User } from '@/types';
import type { DashboardData, DashboardDataSource, DashboardSourceRecords, DashboardTaskItem } from '../types/dashboard';

export async function buildDashboard(user: User): Promise<DashboardData> {
  const [subjects, academicProgress, attendance, studySummary, todaySchedule, assignments, experiments, todayHabits] = await Promise.all([
    academicService.getSubjects(user.id),
    academicService.getOverallProgress(user.id),
    attendanceService.getOverallSummary(user.id),
    studyService.getSummary(user.id),
    timetableService.getToday(user.id),
    assignmentService.getAssignments(user.id),
    experimentService.getProgress(user.id),
    habitService.getToday(user.id),
  ]);

  const tasks: DashboardTaskItem[] = assignments.map((assignment) => {
    const dueState = assignmentDueState(assignment);
    const status: DashboardTaskItem['status'] = dueState === 'COMPLETED'
      ? 'completed'
      : dueState === 'OVERDUE'
        ? 'overdue'
        : dueState === 'DUE_TODAY' || dueState === 'DUE_SOON'
          ? 'due_soon'
          : 'pending';
    return {
      id: assignment.id,
      title: assignment.title,
      context: subjects.find((subject) => subject.id === assignment.subjectId)?.name ?? 'Academic task',
      dueDate: assignment.dueDate,
      status,
    };
  }).sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999')).slice(0, 5);

  const schedule = todaySchedule.slice(0, 6).map((entry) => ({
    id: entry.id,
    time: `${formatTime(entry.startTime)} – ${formatTime(entry.endTime)}`,
    title: entry.title,
    subjectName: subjects.find((subject) => subject.id === entry.subjectId)?.name ?? 'Scheduled class',
    status: 'upcoming' as const,
  }));

  return {
    user: { id: user.id, nickname: user.nickname, displayName: user.displayName },
    summary: {
      academicProgress: academicProgress.overallPercentage,
      attendancePercentage: attendance.total ? attendance.percentage : null,
      todayStudyMinutes: Math.round(studySummary.todaySeconds / 60),
      completedStudySessions: studySummary.completedSessions,
      pendingTasks: tasks.filter((task) => task.status !== 'completed').length,
      upcomingDeadlines: tasks.filter((task) => task.status === 'due_soon').length,
      experimentCompletionPercentage: experiments.completionPercentage,
      habitsCompleted: todayHabits.filter((item) => Boolean(item.record)).length,
      habitsTotal: todayHabits.length,
    },
    schedule,
    tasks,
    progress: subjects.slice(0, 6).map((subject) => ({ id: subject.id, name: subject.name, progress: subject.progress })),
  };
}

export function createMockDashboardDataSource(_records: DashboardSourceRecords = {
  subjects: mockSubjects,
  attendance: mockAttendance,
  studySessions: mockStudySessions,
  timetable: mockTimetable,
  assignments: mockAssignments,
}): DashboardDataSource {
  void _records;
  return { getDashboard: buildDashboard };
}

export function createDashboardDataSource(): DashboardDataSource { return createMockDashboardDataSource(); }
export async function getDashboard(user: User): Promise<DashboardData> { return buildDashboard(user); }
