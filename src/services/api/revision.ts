import type { RevisionRecord } from '@/types';
import { createUserDoc, deleteUserDoc, listUserDocs, updateUserDoc } from '@/services/firebase/db';
import type { RevisionService } from '@/features/productivity/types/productivity';
const now=()=>new Date().toISOString();
export function createApiRevisionService():RevisionService{return {
  async createRevision(uid,input){const t=now();return createUserDoc<RevisionRecord>(uid,'revisions',{userId:uid,...input,createdAt:t,updatedAt:t} as Omit<RevisionRecord,'id'>);},
  async updateRevision(uid,id,input){return updateUserDoc<RevisionRecord>(uid,'revisions',id,{...input,updatedAt:now()});},
  async deleteRevision(uid,id){await deleteUserDoc(uid,'revisions',id);},
  async getRevisions(uid){return (await listUserDocs<RevisionRecord>(uid,'revisions')).sort((a,b)=>b.revisedAt.localeCompare(a.revisedAt));},
};}
