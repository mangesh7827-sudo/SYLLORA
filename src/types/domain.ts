export type ID = string;
export type ISODate = string;
export type ISODateTime = string;

export type CompletionStatus = 'pending' | 'in_progress' | 'completed';
export type AttendanceStatus = 'present' | 'absent';
export type RecordStatus = 'pending' | 'completed';

export interface User { id: ID; email: string; displayName: string; nickname?: string; authenticationProvider: 'password' | 'google'; createdAt: ISODateTime; updatedAt: ISODateTime; }
export interface Subject { id: ID; userId: ID; name: string; description?: string; code?: string; color?: string; requiredAttendancePercentage?: number; createdAt: ISODateTime; updatedAt: ISODateTime; }
export interface Module { id: ID; userId: ID; subjectId: ID; name: string; description?: string; order: number; status: CompletionStatus; createdAt: ISODateTime; updatedAt: ISODateTime; }
export interface Topic { id: ID; userId: ID; moduleId: ID; name: string; description?: string; order: number; status: 'pending' | 'completed'; completedAt?: ISODateTime; createdAt: ISODateTime; updatedAt: ISODateTime; }
export interface TopicProgress { id: ID; userId: ID; topicId: ID; progressPercentage: number; updatedAt: ISODateTime; }
export type StudyTargetType = 'SUBJECT' | 'MODULE' | 'TOPIC' | 'EXTRA_TASK';
export type StudySessionStatus = 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export interface StudySession { id: ID; userId: ID; subjectId?: ID; moduleId?: ID; topicId?: ID; targetType: StudyTargetType; extraTaskLabel?: string; startedAt: ISODateTime; endedAt?: ISODateTime; durationSeconds: number; status: StudySessionStatus; notes?: string; createdAt: ISODateTime; updatedAt: ISODateTime; }
export interface RevisionRecord { id: ID; userId: ID; subjectId: ID; moduleId?: ID; topicId?: ID; revisedAt: ISODateTime; notes?: string; studySessionId?: ID; createdAt: ISODateTime; updatedAt: ISODateTime; }

export interface AttendanceRecord { id: ID; userId: ID; subjectId: ID; date: ISODate; status: AttendanceStatus; lectureTitle?: string; lectureId?: ID; createdAt: ISODateTime; updatedAt: ISODateTime; }
export interface AttendanceSettings { id: ID; userId: ID; subjectId: ID; requiredPercentage: number; createdAt: ISODateTime; updatedAt: ISODateTime; }
export type TimetableType = 'LECTURE' | 'PRACTICAL' | 'EXTRA';
export interface TimetableEntry { id: ID; userId: ID; subjectId?: ID; title: string; dayOfWeek: number; startTime: string; endTime: string; room?: string; professor?: string; batch?: string; type: TimetableType; createdAt: ISODateTime; updatedAt: ISODateTime; }
export interface ExtraLecture { id: ID; userId: ID; subjectId: ID; title: string; date: ISODate; startTime: string; endTime: string; room?: string; professor?: string; batch?: string; type: 'EXTRA'; createdAt: ISODateTime; updatedAt: ISODateTime; }
export type AssignmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export interface Assignment { id: ID; userId: ID; subjectId: ID; title: string; description?: string; dueDate: ISODateTime; status: AssignmentStatus; completedAt?: ISODateTime; notes?: string; createdAt: ISODateTime; updatedAt: ISODateTime; }
export type ExperimentCompletionStatus = 'PENDING' | 'COMPLETED';
export type ExperimentCheckedStatus = 'NOT_CHECKED' | 'CHECKED';
export interface Experiment { id: ID; userId: ID; subjectId: ID; experimentNumber: number; name: string; description?: string; dueDate?: ISODate; completionStatus: ExperimentCompletionStatus; checkedStatus: ExperimentCheckedStatus; completedAt?: ISODateTime; checkedAt?: ISODateTime; createdAt: ISODateTime; updatedAt: ISODateTime; }
export type HabitFrequency = 'DAILY' | 'WEEKLY';
export interface Habit { id: ID; userId: ID; name: string; description?: string; frequency: HabitFrequency; targetDays?: number[]; active: boolean; createdAt: ISODateTime; updatedAt: ISODateTime; }
export interface HabitRecord { id: ID; userId: ID; habitId: ID; date: ISODate; completed: boolean; createdAt: ISODateTime; updatedAt: ISODateTime; }
export interface Project { id: ID; userId: ID; subjectId?: ID; name: string; dueDate?: ISODate; status: RecordStatus; }
export interface Reminder { id: ID; userId: ID; title: string; scheduledFor: ISODateTime; completed: boolean; }
export interface Notification { id: ID; userId: ID; title: string; message: string; read: boolean; createdAt: ISODateTime; }
export interface Report { id: ID; userId: ID; name: string; generatedAt: ISODateTime; }
