import type { Assignment, AttendanceRecord, Subject, StudySession, TimetableEntry, User } from '@/types';
export interface DashboardSummary { academicProgress:number; attendancePercentage:number|null; todayStudyMinutes:number; completedStudySessions:number; pendingTasks:number; upcomingDeadlines:number; experimentCompletionPercentage:number; habitsCompleted:number; habitsTotal:number; }
export interface DashboardScheduleItem { id:string; time:string; title:string; subjectName:string; status:'upcoming'|'current'|'completed'; }
export interface DashboardTaskItem { id:string; title:string; context:string; dueDate:string|null; status:'pending'|'due_soon'|'overdue'|'completed'; }
export interface DashboardProgressItem { id:string; name:string; progress:number; }
export interface DashboardData { user:Pick<User,'id'|'nickname'|'displayName'>; summary:DashboardSummary; schedule:DashboardScheduleItem[]; tasks:DashboardTaskItem[]; progress:DashboardProgressItem[]; }
export type DashboardDataSource={getDashboard(user:User):Promise<DashboardData>};
export type DashboardSourceRecords={subjects:Subject[];attendance:AttendanceRecord[];studySessions:StudySession[];timetable:TimetableEntry[];assignments:Assignment[]};
