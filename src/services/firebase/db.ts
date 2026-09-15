import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';
import { firebaseDb } from './config';

function cleanData<T extends DocumentData>(data: T): DocumentData {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
}

function collectionRef(userId: string, name: string) {
  return collection(firebaseDb, 'users', userId, name);
}

export async function listUserDocs<T extends DocumentData>(
  userId: string,
  name: string
): Promise<T[]> {
  const snapshot = await getDocs(collectionRef(userId, name));

  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() } as unknown as T)
  );
}

export async function getUserDoc<T extends DocumentData>(
  userId: string,
  name: string,
  id: string
): Promise<T | null> {
  const snapshot = await getDoc(
    doc(firebaseDb, 'users', userId, name, id)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as unknown as T;
}

export async function createUserDoc<T extends DocumentData>(
  userId: string,
  name: string,
  data: Omit<T, 'id'>
): Promise<T> {
  const clean = cleanData(data);
  const reference = await addDoc(
    collectionRef(userId, name),
    clean
  );

  return {
    id: reference.id,
    ...clean,
  } as unknown as T;
}

export async function setUserDoc<T extends DocumentData>(
  userId: string,
  name: string,
  id: string,
  data: T
): Promise<T> {
  const clean = cleanData(data);

  await setDoc(
    doc(firebaseDb, 'users', userId, name, id),
    clean,
    { merge: true }
  );

  return {
    ...data,
    id,
  } as T;
}

export async function updateUserDoc<T extends DocumentData>(
  userId: string,
  name: string,
  id: string,
  data: Partial<T>
): Promise<T> {
  const clean = cleanData(data);

  await updateDoc(
    doc(firebaseDb, 'users', userId, name, id),
    clean
  );

  const next = await getUserDoc<T>(
    userId,
    name,
    id
  );

  if (!next) {
    throw new Error(
      'The requested record no longer exists.'
    );
  }

  return next;
}

export async function deleteUserDoc(
  userId: string,
  name: string,
  id: string
): Promise<void> {
  await deleteDoc(
    doc(firebaseDb, 'users', userId, name, id)
  );
}

export function userDocPath(userId: string) {
  return doc(firebaseDb, 'users', userId);
}