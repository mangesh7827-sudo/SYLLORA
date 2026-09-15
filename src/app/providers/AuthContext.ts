import { createContext, useContext } from 'react';
import type { AuthResult, AuthState, LoginCredentials, SignupData, User } from '@/types';

export interface AuthContextValue {
  state: AuthState;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login(credentials: LoginCredentials): Promise<AuthResult>;
  signup(data: SignupData): Promise<AuthResult>;
  logout(): Promise<void>;
  refreshSession(): Promise<AuthResult | null>;
  googleLogin(): Promise<AuthResult>;
  requestPasswordReset(email: string): Promise<void>;
  clearError(): void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
