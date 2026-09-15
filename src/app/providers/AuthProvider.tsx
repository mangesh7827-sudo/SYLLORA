import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { AuthError, type AuthResult, type AuthState, type LoginCredentials, type SignupData, type User } from '@/types';
import { authService } from '@/services/auth/service';
import { firebaseAuthService } from '@/services/firebase/auth';
import { AuthContext, type AuthContextValue } from './AuthContext';

function messageForError(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>('AUTH_LOADING');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applySuccess = useCallback((result: AuthResult) => {
    setCurrentUser(result.user); setError(null); setState('AUTHENTICATED'); return result;
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const result = await authService.refreshSession();
      if (!result) { setCurrentUser(null); setError(null); setState('UNAUTHENTICATED'); return null; }
      return applySuccess(result);
    } catch (caught) {
      setCurrentUser(null); setError(messageForError(caught)); setState('AUTH_ERROR'); return null;
    }
  }, [applySuccess]);

  useEffect(() => {
    const unsubscribe = firebaseAuthService.subscribe((result) => {
      if (result) applySuccess(result);
      else { setCurrentUser(null); setError(null); setState('UNAUTHENTICATED'); }
    });
    return unsubscribe;
  }, [applySuccess]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try { return applySuccess(await authService.login(credentials)); }
    catch (caught) { setCurrentUser(null); setError(messageForError(caught)); setState('AUTH_ERROR'); throw caught; }
  }, [applySuccess]);

  const signup = useCallback(async (data: SignupData) => {
    try { return applySuccess(await authService.signup(data)); }
    catch (caught) { setError(messageForError(caught)); setState('AUTH_ERROR'); throw caught; }
  }, [applySuccess]);

  const logout = useCallback(async () => {
    try { await authService.logout(); setCurrentUser(null); setError(null); setState('UNAUTHENTICATED'); }
    catch (caught) { setError(messageForError(caught)); setState('AUTH_ERROR'); throw caught; }
  }, []);

  const googleLogin = useCallback(async () => {
    try { return applySuccess(await authService.googleLogin()); }
    catch (caught) { setError(messageForError(caught)); setState('AUTH_ERROR'); throw caught; }
  }, [applySuccess]);

  const requestPasswordReset = useCallback(async (email: string) => {
    try { await authService.requestPasswordReset(email); setError(null); }
    catch (caught) { setError(messageForError(caught)); throw caught; }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(() => ({ state, currentUser, isAuthenticated: state === 'AUTHENTICATED' && Boolean(currentUser), isLoading: state === 'AUTH_LOADING', error, login, signup, logout, refreshSession, googleLogin, requestPasswordReset, clearError }), [state, currentUser, error, login, signup, logout, refreshSession, googleLogin, requestPasswordReset, clearError]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
