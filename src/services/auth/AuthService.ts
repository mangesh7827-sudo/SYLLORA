import type { AuthResult, LoginCredentials, SignupData, User } from '@/types';

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  signup(data: SignupData): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthResult | null>;
  refreshSession(): Promise<AuthResult | null>;
  googleLogin(): Promise<AuthResult>;
  requestPasswordReset(email: string): Promise<void>;
  updateAccount?(nickname: string, email: string): Promise<AuthResult>;
}

export interface AuthServiceUserStore {
  loadUsers(): User[];
  saveUsers(users: User[]): void;
}
