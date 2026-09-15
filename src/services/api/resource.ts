import type { ID } from '@/types';
import { createUserDoc, deleteUserDoc, getUserDoc, listUserDocs, updateUserDoc } from '@/services/firebase/db';
export interface ApiResource<T extends { id: ID; userId: ID }> { list(userId?: ID): Promise<T[]>; getById(id: ID, userId?: ID): Promise<T | null>; create?(userId:ID,input:Omit<T,'id'|'userId'>):Promise<T>; update?(userId:ID,id:ID,input:Partial<T>):Promise<T>; delete?(userId:ID,id:ID):Promise<void>; }
export function createApiResource<T extends { id: ID; userId: ID }>(resourcePath:string):ApiResource<T>{return {
  async list(userId){if(!userId)throw new Error('You must be signed in.');return listUserDocs<T>(userId,resourcePath);},
  async getById(id,userId){if(!userId)throw new Error('You must be signed in.');return getUserDoc<T>(userId,resourcePath,id);},
  async create(userId,input){return createUserDoc<T>(userId,resourcePath,{userId,...input} as Omit<T,'id'>);},
  async update(userId,id,input){return updateUserDoc<T>(userId,resourcePath,id,input);},
  async delete(userId,id){return deleteUserDoc(userId,resourcePath,id);},
};}
