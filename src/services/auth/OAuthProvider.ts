import type { AuthProvider, AuthResult } from '@/types';

export interface OAuthProviderAdapter {
  readonly provider: AuthProvider;
  signIn(): Promise<AuthResult>;
}

export class UnavailableGoogleProvider implements OAuthProviderAdapter {
  readonly provider = 'google' as const;

  async signIn(): Promise<AuthResult> {
    throw new Error('Google OAuth is not configured.');
  }
}
