import { mockUsers } from '@/data/mock/users';
import { AuthError, type AuthResult, type AuthSession, type LoginCredentials, type SignupData, type User } from '@/types';
import { localStorageAdapter } from '@/services/storage/storage';
import type { AuthService } from './AuthService';

const USERS_KEY = 'syllora.dev.auth.users';
const SESSION_KEY = 'syllora.dev.auth.session';
const SESSION_DAYS = 7;

interface StoredMockUser {
  user: User;
  passwordHash: string;
}

function nowIso() {
  return new Date().toISOString();
}

function getSessionExpiry() {
  const date = new Date();
  date.setDate(date.getDate() + SESSION_DAYS);
  return date.toISOString();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function hashPassword(password: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new AuthError('unknown', 'Secure password processing is unavailable in this browser.');
  }
  const data = new TextEncoder().encode(password);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function loadStoredUsers(): StoredMockUser[] {
  const stored = localStorageAdapter.get<StoredMockUser[]>(USERS_KEY);
  if (stored && Array.isArray(stored)) return stored;
  return mockUsers.map((user) => ({ user, passwordHash: '' }));
}

function saveStoredUsers(users: StoredMockUser[]) {
  localStorageAdapter.set(USERS_KEY, users);
}

function createSession(userId: string): AuthSession {
  return { userId, issuedAt: nowIso(), expiresAt: getSessionExpiry() };
}

function saveSession(session: AuthSession) {
  localStorageAdapter.set(SESSION_KEY, session);
}

function getStoredSession(): AuthSession | null {
  const session = localStorageAdapter.get<AuthSession>(SESSION_KEY);
  if (!session?.userId) return null;
  if (session.expiresAt && new Date(session.expiresAt).getTime() <= Date.now()) {
    localStorageAdapter.remove(SESSION_KEY);
    return null;
  }
  return session;
}

function resultFor(user: User, session: AuthSession): AuthResult {
  return { user, session };
}

/**
 * Development-only auth adapter. It is deliberately isolated behind AuthService.
 * It never stores plaintext passwords; the password verifier stores only a SHA-256
 * digest for local development. This is NOT production authentication.
 */
export class MockAuthService implements AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const email = credentials.email.trim().toLowerCase();
    const storedUsers = loadStoredUsers();
    const record = storedUsers.find((entry) => entry.user.email.toLowerCase() === email);
    if (!isValidEmail(email) || !credentials.password || !record?.passwordHash) {
      throw new AuthError('invalid_credentials', 'Email or password is incorrect.');
    }

    const passwordHash = await hashPassword(credentials.password);
    if (passwordHash !== record.passwordHash) {
      throw new AuthError('invalid_credentials', 'Email or password is incorrect.');
    }

    const session = createSession(record.user.id);
    saveSession(session);
    return resultFor(record.user, session);
  }

  async signup(data: SignupData): Promise<AuthResult> {
    const nickname = data.nickname.trim();
    const email = data.email.trim().toLowerCase();
    if (!isValidEmail(email)) throw new AuthError('invalid_email', 'Enter a valid email address.');
    if (data.password.length < 8) throw new AuthError('weak_password', 'Password must be at least 8 characters.');
    if (data.password !== data.confirmPassword) throw new AuthError('password_mismatch', 'Passwords do not match.');
    if (nickname.length < 2 || nickname.length > 40) throw new AuthError('unknown', 'Nickname must be between 2 and 40 characters.');

    const storedUsers = loadStoredUsers();
    if (storedUsers.some((entry) => entry.user.email.toLowerCase() === email)) {
      throw new AuthError('duplicate_account', 'An account with these details could not be created.');
    }

    const timestamp = nowIso();
    const user: User = {
      id: `user-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`,
      email,
      displayName: nickname,
      nickname,
      authenticationProvider: 'password',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const passwordHash = await hashPassword(data.password);
    storedUsers.push({ user, passwordHash });
    saveStoredUsers(storedUsers);

    const session = createSession(user.id);
    saveSession(session);
    return resultFor(user, session);
  }

  async logout() {
    localStorageAdapter.remove(SESSION_KEY);
  }

  async getCurrentUser(): Promise<AuthResult | null> {
    const session = getStoredSession();
    if (!session) return null;
    const user = loadStoredUsers().find((entry) => entry.user.id === session.userId)?.user;
    if (!user) {
      localStorageAdapter.remove(SESSION_KEY);
      return null;
    }
    return resultFor(user, session);
  }

  async refreshSession(): Promise<AuthResult | null> {
    return this.getCurrentUser();
  }

  async googleLogin(): Promise<AuthResult> {
    throw new AuthError('oauth_unavailable', 'Google sign-in is not configured yet.');
  }

  async requestPasswordReset(): Promise<void> {
    throw new AuthError('recovery_unavailable', 'Password recovery will be available when the authentication backend is connected.');
  }
}
