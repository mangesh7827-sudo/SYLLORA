import type { ISODateTime, User } from './domain';

export type AuthProvider = 'password' | 'google';

export type AuthState = 'AUTH_LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED' | 'AUTH_ERROR';

export interface AuthSession {
  userId: string;
  issuedAt: ISODateTime;
  expiresAt?: ISODateTime;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResult {
  user: User;
  session: AuthSession;
}

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'invalid_email'
  | 'weak_password'
  | 'password_mismatch'
  | 'duplicate_account'
  | 'network_error'
  | 'server_error'
  | 'oauth_unavailable'
  | 'oauth_error'
  | 'session_expired'
  | 'recovery_unavailable'
  | 'unknown';

export class AuthError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
