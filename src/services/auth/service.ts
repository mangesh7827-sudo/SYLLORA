import type { AuthService } from './AuthService';
import { firebaseAuthService } from '@/services/firebase/auth';

export const authService: AuthService = firebaseAuthService;
export { firebaseAuthService };
