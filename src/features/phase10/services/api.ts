import { firebaseAuthService } from '@/services/firebase/auth';
import { firebaseAuth } from '@/services/firebase/config';
import { createUserDoc, deleteUserDoc, getUserDoc, listUserDocs, updateUserDoc, setUserDoc } from '@/services/firebase/db';
import type { AttendanceRecord, Assignment, Experiment, Habit, Project, Reminder, StudySession, RevisionRecord } from '@/types';
import { academicService } from '@/features/academics/services/academicService';
import { calculateAssignmentSummary, calculateExperimentProgress, calculateAttendancePercentage } from '@/features/phase8/utils/calculations';
import { attendanceService, assignmentService, experimentService, habitService, timetableService } from '@/features/phase8/services';
import { studyService } from '@/features/productivity/services/studyService';
import { revisionService } from '@/features/productivity/services/revisionService';
import { localDateKey } from '@/features/productivity/utils/time';

export interface ReportFilters { from?:string; to?:string; subjectId?:string; moduleId?:string }
export interface ReportData { filters:ReportFilters; academic:{total_subjects:number;total_modules:number;total_topics:number;completed_topics:number;overallPercentage:number;subjects:Array<{id:string;name:string;total_topics:number;completed_topics:number;progressPercentage:number}>}; attendance:{total:number;present:number;absent:number;percentage:number;subjects:Array<{subject_id:string;name:string;total:number;present:number;absent:number;requiredPercentage:number;percentage:number}>}; study:{totalSeconds:number;bySubject:Array<{subject_name:string;subject_id:string;seconds:number|string;sessions:number}>}; revision:{total:number;subjects:number}; assignments:{total:number;completed:number;pending:number;in_progress:number;overdue:number;due_soon:number}; experiments:{total:number;completed:number;pending:number;checked:number;not_checked:number;overdue:number;due_soon:number}; habits:{total_habits:number;active_habits:number}; generatedAt:string }

function uid(){const id=firebaseAuth.currentUser?.uid;if(!id)throw new Error('You must be signed in.');return id;}
function inRange(date:string,from?:string,to?:string){return (!from||date>=from)&&(!to||date<=to);}

export const projectsService={
  list:async()=>listUserDocs<Project>(uid(),'projects'),
  create:async(input:Omit<Project,'id'|'userId'>)=>createUserDoc<Project>(uid(),'projects',{userId:uid(),...input} as Omit<Project,'id'>),
  update:async(id:string,input:Partial<Project>)=>updateUserDoc<Project>(uid(),'projects',id,input),
  remove:async(id:string)=>deleteUserDoc(uid(),'projects',id),
};
export const remindersService={
  list:async()=>listUserDocs<Reminder>(uid(),'reminders'),
  create:async(input:Omit<Reminder,'id'|'userId'>)=>createUserDoc<Reminder>(uid(),'reminders',{userId:uid(),...input} as Omit<Reminder,'id'>),
  update:async(id:string,input:Partial<Reminder>)=>updateUserDoc<Reminder>(uid(),'reminders',id,input),
  remove:async(id:string)=>deleteUserDoc(uid(),'reminders',id),
};

export interface NotificationItem {id:string;userId:string;type:string;title:string;message:string;read:boolean;isRead:boolean;createdAt:string;readAt?:string;relatedEntityType?:string;relatedEntityId?:string}
export interface NotificationPreferences {lecture_reminders:boolean;assignment_reminders:boolean;experiment_reminders:boolean;attendance_alerts:boolean;study_reminders:boolean;habit_reminders:boolean}
const defaultPrefs:NotificationPreferences={lecture_reminders:true,assignment_reminders:true,experiment_reminders:true,attendance_alerts:true,study_reminders:true,habit_reminders:true};
export const notificationsService={
  async list(unread=false){const items=await listUserDocs<NotificationItem>(uid(),'notifications');return items.filter(x=>!unread||!x.read).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));},
  async markRead(id:string){return updateUserDoc<NotificationItem>(uid(),'notifications',id,{read:true,isRead:true,readAt:new Date().toISOString()});},
  async markAllRead(){const items=await listUserDocs<NotificationItem>(uid(),'notifications');await Promise.all(items.filter(x=>!x.read).map(x=>updateUserDoc<NotificationItem>(uid(),'notifications',x.id,{read:true,isRead:true,readAt:new Date().toISOString()})));return {updated:true};},
  async getPreferences(){return (await getUserDoc<NotificationPreferences>(uid(),'settings','notifications'))??defaultPrefs;},
  async updatePreferences(input:Partial<NotificationPreferences>){const current=await this.getPreferences();return setUserDoc<NotificationPreferences>(uid(),'settings','notifications',{...current,...input});},
};

export const reportsService={
  async get(filters:ReportFilters={}):Promise<ReportData>{
    const userId=uid();
    const [subjects,modules,topics,attendance,settings,study,revisions,assignments,experiments,habits]=await Promise.all([
      academicService.getSubjects(userId), listUserDocs<any>(userId,'modules'), listUserDocs<any>(userId,'topics'),
      attendanceService.getRecords(userId), attendanceService.getSettings(userId), studyService.getSessions(userId), revisionService.getRevisions(userId),
      assignmentService.getAssignments(userId), experimentService.getExperiments(userId), listUserDocs<Habit>(userId,'habits'),
    ]);
    const filteredAttendance=attendance.filter(r=>inRange(r.date,filters.from,filters.to)&&( !filters.subjectId||r.subjectId===filters.subjectId));
    const subjectRows=subjects.filter(s=>!filters.subjectId||s.id===filters.subjectId).map(s=>{const r=filteredAttendance.filter(x=>x.subjectId===s.id);const p=r.filter(x=>x.status==='present').length;const req=settings.find(x=>x.subjectId===s.id)?.requiredPercentage??75;return {subject_id:s.id,name:s.name,total:r.length,present:p,absent:r.length-p,requiredPercentage:req,percentage:calculateAttendancePercentage(p,r.length)};});
    const ap={total_subjects:subjects.length,total_modules:modules.filter(m=>!filters.subjectId||m.subjectId===filters.subjectId).length,total_topics:topics.filter(t=>{const m=modules.find(x=>x.id===t.moduleId);return (!filters.subjectId||m?.subjectId===filters.subjectId)&&(!filters.moduleId||t.moduleId===filters.moduleId);}).length,completed_topics:0,overallPercentage:0,subjects:subjects.filter(s=>!filters.subjectId||s.id===filters.subjectId).map(s=>{const ms=modules.filter(m=>m.subjectId===s.id&&(!filters.moduleId||m.id===filters.moduleId));const ts=topics.filter(t=>ms.some(m=>m.id===t.moduleId));const c=ts.filter(t=>t.status==='completed').length;return {id:s.id,name:s.name,total_topics:ts.length,completed_topics:c,progressPercentage:ts.length?Number((c/ts.length*100).toFixed(1)):0};})};
    ap.completed_topics=ap.subjects.reduce((n,s)=>n+s.completed_topics,0);ap.overallPercentage=ap.total_topics?Number((ap.completed_topics/ap.total_topics*100).toFixed(1)):0;
    const studyRows=study.filter(s=>s.status==='COMPLETED'&&inRange(localDateKey(new Date(s.startedAt)),filters.from,filters.to)&&(!filters.subjectId||s.subjectId===filters.subjectId)&&(!filters.moduleId||s.moduleId===filters.moduleId));
    const bySubject=subjects.map(s=>{const rows=studyRows.filter(x=>x.subjectId===s.id);return {subject_name:s.name,subject_id:s.id,seconds:rows.reduce((n,x)=>n+x.durationSeconds,0),sessions:rows.length};}).filter(x=>x.sessions);
    const rev=revisions.filter(r=>inRange(localDateKey(new Date(r.revisedAt)),filters.from,filters.to)&&(!filters.subjectId||r.subjectId===filters.subjectId));
    const as=calculateAssignmentSummary(assignments.filter(a=>!filters.subjectId||a.subjectId===filters.subjectId));
    const ex=calculateExperimentProgress(experiments.filter(e=>!filters.subjectId||e.subjectId===filters.subjectId));
    const dueSoon=assignments.filter(a=>a.status!=='COMPLETED'&&(!filters.subjectId||a.subjectId===filters.subjectId)).filter(a=>{const d=new Date(a.dueDate),today=new Date();today.setHours(0,0,0,0);const soon=new Date(today);soon.setDate(soon.getDate()+2);return d>=today&&d<=new Date(soon.getTime()+86399999)}).length;
    const overdue=assignments.filter(a=>a.status!=='COMPLETED'&&(!filters.subjectId||a.subjectId===filters.subjectId)&&new Date(a.dueDate)<new Date()).length;
    const expFiltered=experiments.filter(e=>!filters.subjectId||e.subjectId===filters.subjectId);const expOverdue=expFiltered.filter(e=>e.completionStatus!=='COMPLETED'&&e.dueDate&&new Date(e.dueDate)<new Date()).length;const expSoon=expFiltered.filter(e=>e.completionStatus!=='COMPLETED'&&e.dueDate&&new Date(e.dueDate)>=new Date()&&new Date(e.dueDate)<=new Date(Date.now()+2*86400000)).length;
    return {filters,academic:ap,attendance:{total:filteredAttendance.length,present:filteredAttendance.filter(x=>x.status==='present').length,absent:filteredAttendance.filter(x=>x.status==='absent').length,percentage:calculateAttendancePercentage(filteredAttendance.filter(x=>x.status==='present').length,filteredAttendance.length),subjects:subjectRows},study:{totalSeconds:studyRows.reduce((n,x)=>n+x.durationSeconds,0),bySubject},revision:{total:rev.length,subjects:new Set(rev.map(r=>r.subjectId)).size},assignments:{total:as.total,completed:as.completed,pending:as.pending,in_progress:as.inProgress,overdue,due_soon:dueSoon},experiments:{total:ex.total,completed:ex.completed,pending:ex.total-ex.completed,checked:ex.checked,not_checked:ex.total-ex.checked,overdue:expOverdue,due_soon:expSoon},habits:{total_habits:habits.length,active_habits:habits.filter(h=>h.active).length},generatedAt:new Date().toISOString()};
  },
  async attendanceCsv(filters:ReportFilters={}){const data=await this.get(filters);const rows=[['Subject','Total','Present','Absent','Percentage'] ,...data.attendance.subjects.map(s=>[s.name,String(s.total),String(s.present),String(s.absent),`${s.percentage}%`])];const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');return new Blob([csv],{type:'text/csv;charset=utf-8'});},
};

export async function updateCurrentUserAccount(nickname:string,email:string){return firebaseAuthService.updateAccount(nickname,email);}
