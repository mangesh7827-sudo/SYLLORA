import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from './config';
import { firebaseErrorMessage } from './errors';
import type { AuthResult, LoginCredentials, SignupData, User } from '@/types';

function nowIso() { return new Date().toISOString(); }

async function profileFor(firebaseUser: FirebaseUser): Promise<User> {
  const profileRef = doc(firebaseDb, 'users', firebaseUser.uid);
  const snapshot = await getDoc(profileRef);
  const existing = snapshot.exists() ? snapshot.data() : {};
  const timestamp = nowIso();
  const profile: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName: firebaseUser.displayName ?? existing.displayName ?? existing.nickname ?? 'Syllora User',
    nickname: existing.nickname ?? firebaseUser.displayName ?? undefined,
    authenticationProvider: firebaseUser.providerData.some((p) => p.providerId === 'google.com') ? 'google' : 'password',
    createdAt: existing.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  await setDoc(profileRef, profile, { merge: true });
  return profile;
}

async function resultFor(firebaseUser: FirebaseUser): Promise<AuthResult> {
  const token = await firebaseUser.getIdTokenResult();
  return {
    user: await profileFor(firebaseUser),
    session: {
      userId: firebaseUser.uid,
      issuedAt: new Date(token.authTime ?? Date.now()).toISOString(),
      expiresAt: token.expirationTime,
    },
  };
}

export class FirebaseAuthService {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const result = await signInWithEmailAndPassword(firebaseAuth, credentials.email.trim().toLowerCase(), credentials.password);
      return resultFor(result.user);
    } catch (error) { throw new Error(firebaseErrorMessage(error)); }
  }

  async signup(data: SignupData): Promise<AuthResult> {
    if (data.password !== data.confirmPassword) throw new Error('Passwords do not match.');
    if (data.nickname.trim().length < 2 || data.nickname.trim().length > 40) throw new Error('Nickname must be between 2 and 40 characters.');
    try {
      const result = await createUserWithEmailAndPassword(firebaseAuth, data.email.trim().toLowerCase(), data.password);
      await updateProfile(result.user, { displayName: data.nickname.trim() });
      await setDoc(doc(firebaseDb, 'users', result.user.uid), {
        id: result.user.uid,
        email: result.user.email ?? data.email.trim().toLowerCase(),
        displayName: data.nickname.trim(),
        nickname: data.nickname.trim(),
        authenticationProvider: 'password',
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      return resultFor(result.user);
    } catch (error) { throw new Error(firebaseErrorMessage(error)); }
  }

  async logout(): Promise<void> { await signOut(firebaseAuth); }

  async getCurrentUser(): Promise<AuthResult | null> {
    return firebaseAuth.currentUser ? resultFor(firebaseAuth.currentUser) : null;
  }

  async refreshSession(): Promise<AuthResult | null> {
    const user = firebaseAuth.currentUser;
    return user ? resultFor(user) : null;
  }

  async googleLogin(): Promise<AuthResult> {
    try {
      const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      return resultFor(result.user);
    } catch (error) { throw new Error(firebaseErrorMessage(error)); }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try { await sendPasswordResetEmail(firebaseAuth, email.trim().toLowerCase()); }
    catch (error) { throw new Error(firebaseErrorMessage(error)); }
  }

  async updateAccount(nickname: string, email: string): Promise<AuthResult> {
    const user = firebaseAuth.currentUser;
    if (!user) throw new Error('You are not signed in.');
    const cleanNickname = nickname.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanNickname.length < 2 || cleanNickname.length > 40) throw new Error('Nickname must be between 2 and 40 characters.');
    try {
      if (user.email !== cleanEmail) await updateEmail(user, cleanEmail);
      if (user.displayName !== cleanNickname) await updateProfile(user, { displayName: cleanNickname });
      const timestamp = nowIso();
      await setDoc(doc(firebaseDb, 'users', user.uid), { email: cleanEmail, displayName: cleanNickname, nickname: cleanNickname, updatedAt: timestamp }, { merge: true });
      return resultFor(user);
    } catch (error) { throw new Error(firebaseErrorMessage(error)); }
  }

  subscribe(callback: (result: AuthResult | null) => void) {
    return onAuthStateChanged(firebaseAuth, (user) => { void (async () => callback(user ? await resultFor(user) : null))(); });
  }
}

export const firebaseAuthService = new FirebaseAuthService();
