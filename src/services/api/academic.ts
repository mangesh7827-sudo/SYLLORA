import type { Module, Subject, Topic } from '@/types';
import { createUserDoc, deleteUserDoc, getUserDoc, listUserDocs, updateUserDoc } from '@/services/firebase/db';
import type { AcademicProgress, AcademicService, ModuleSummary, SubjectSummary, SubjectInput, ModuleInput, TopicInput } from '@/features/academics/types/academic';

const now = () => new Date().toISOString();
const clean = (v?: string) => v?.trim() || undefined;
const progress = (completed: number, total: number) => total ? Number((completed / total * 100).toFixed(1)) : 0;

async function subjects(userId: string) { return listUserDocs<Subject>(userId, 'subjects'); }
async function modules(userId: string) { return listUserDocs<Module>(userId, 'modules'); }
async function topics(userId: string) { return listUserDocs<Topic>(userId, 'topics'); }

function subjectSummary(subject: Subject, allModules: Module[], allTopics: Topic[]): SubjectSummary {
  const ms = allModules.filter(m => m.subjectId === subject.id);
  const ts = allTopics.filter(t => ms.some(m => m.id === t.moduleId));
  const completed = ts.filter(t => t.status === 'completed').length;
  return { ...subject, moduleCount: ms.length, topicCount: ts.length, completedTopicCount: completed, progress: progress(completed, ts.length) };
}
function moduleSummary(module: Module, allTopics: Topic[]): ModuleSummary {
  const ts = allTopics.filter(t => t.moduleId === module.id).sort((a,b)=>a.order-b.order);
  const completed = ts.filter(t=>t.status==='completed').length;
  const status = ts.length && completed === ts.length ? 'completed' : completed ? 'in_progress' : 'pending';
  return { ...module, status, topicCount: ts.length, completedTopicCount: completed, progress: progress(completed, ts.length) };
}

export function createApiAcademicService(): AcademicService {
  return {
    async getSubjects(userId) { const [s,m,t]=await Promise.all([subjects(userId),modules(userId),topics(userId)]); return s.map(x=>subjectSummary(x,m,t)); },
    async getSubject(userId,id) { const s=await getUserDoc<Subject>(userId,'subjects',id); if(!s)return null; const [m,t]=await Promise.all([modules(userId),topics(userId)]); return subjectSummary(s,m,t); },
    async createSubject(userId,input:SubjectInput) { if(!input.name.trim())throw new Error('Subject name is required.'); const timestamp=now(); return createUserDoc<Subject>(userId,'subjects',{userId,name:input.name.trim(),code:clean(input.code),description:clean(input.description),createdAt:timestamp,updatedAt:timestamp} as Omit<Subject,'id'>); },
    async updateSubject(userId,id,input) { if(!input.name.trim())throw new Error('Subject name is required.'); return updateUserDoc<Subject>(userId,'subjects',id,{name:input.name.trim(),code:clean(input.code),description:clean(input.description),updatedAt:now()}); },
    async deleteSubject(userId,id) { const [ms,ts]=await Promise.all([modules(userId),topics(userId)]); await deleteUserDoc(userId,'subjects',id); await Promise.all(ms.filter(m=>m.subjectId===id).map(m=>deleteUserDoc(userId,'modules',m.id))); const mids=new Set(ms.filter(m=>m.subjectId===id).map(m=>m.id)); await Promise.all(ts.filter(t=>mids.has(t.moduleId)).map(t=>deleteUserDoc(userId,'topics',t.id))); },
    async getModules(userId,subjectId) { const [s,m,t]=await Promise.all([getUserDoc<Subject>(userId,'subjects',subjectId),modules(userId),topics(userId)]); if(!s)return []; return m.filter(x=>x.subjectId===subjectId).sort((a,b)=>a.order-b.order).map(x=>moduleSummary(x,t)); },
    async getModule(userId,id) { const m=await getUserDoc<Module>(userId,'modules',id); if(!m)return null; return moduleSummary(m,await topics(userId)); },
    async createModule(userId,subjectId,input:ModuleInput) { if(!input.name.trim())throw new Error('Module name is required.'); if(!await getUserDoc<Subject>(userId,'subjects',subjectId))throw new Error('Subject not found.'); const ms=await modules(userId); const order=input.order ?? Math.max(0,...ms.filter(m=>m.subjectId===subjectId).map(m=>m.order))+1; const timestamp=now(); return createUserDoc<Module>(userId,'modules',{userId,subjectId,name:input.name.trim(),description:clean(input.description),order,status:'pending',createdAt:timestamp,updatedAt:timestamp} as Omit<Module,'id'>); },
    async updateModule(userId,id,input) { if(!input.name.trim())throw new Error('Module name is required.'); return updateUserDoc<Module>(userId,'modules',id,{name:input.name.trim(),description:clean(input.description),...(input.order!==undefined?{order:input.order}:{}),updatedAt:now()}); },
    async deleteModule(userId,id) { const ts=await topics(userId); await deleteUserDoc(userId,'modules',id); await Promise.all(ts.filter(t=>t.moduleId===id).map(t=>deleteUserDoc(userId,'topics',t.id))); },
    async getTopics(userId,moduleId) { return (await topics(userId)).filter(t=>t.moduleId===moduleId).sort((a,b)=>a.order-b.order); },
    async getTopic(userId,id) { return getUserDoc<Topic>(userId,'topics',id); },
    async createTopic(userId,moduleId,input:TopicInput) { if(!input.name.trim())throw new Error('Topic name is required.'); if(!await getUserDoc<Module>(userId,'modules',moduleId))throw new Error('Module not found.'); const ts=await topics(userId); const order=input.order ?? Math.max(0,...ts.filter(t=>t.moduleId===moduleId).map(t=>t.order))+1; const status=input.status==='completed'?'completed':'pending'; const timestamp=now(); return createUserDoc<Topic>(userId,'topics',{userId,moduleId,name:input.name.trim(),description:clean(input.description),order,status,completedAt:status==='completed'?timestamp:undefined,createdAt:timestamp,updatedAt:timestamp} as Omit<Topic,'id'>); },
    async updateTopic(userId,id,input:TopicInput) { if(!input.name.trim())throw new Error('Topic name is required.'); const old=await getUserDoc<Topic>(userId,'topics',id); if(!old)throw new Error('Topic not found.'); const status=input.status ?? old.status; const timestamp=now(); return updateUserDoc<Topic>(userId,'topics',id,{name:input.name.trim(),description:clean(input.description),order:input.order??old.order,status,completedAt:status==='completed'?(old.completedAt??timestamp):undefined,updatedAt:timestamp}); },
    async deleteTopic(userId,id) { await deleteUserDoc(userId,'topics',id); },
    async setTopicStatus(userId,id,status) { const topic=await getUserDoc<Topic>(userId,'topics',id); if(!topic)throw new Error('Topic not found.'); return updateUserDoc<Topic>(userId,'topics',id,{status,completedAt:status==='completed'?(topic.completedAt??now()):undefined,updatedAt:now()}); },
    async getOverallProgress(userId):Promise<AcademicProgress> { const [s,m,t]=await Promise.all([subjects(userId),modules(userId),topics(userId)]); const completed=t.filter(x=>x.status==='completed').length; return {totalSubjects:s.length,totalModules:m.length,totalTopics:t.length,completedTopics:completed,pendingTopics:t.length-completed,overallPercentage:progress(completed,t.length)}; },
  };
}
