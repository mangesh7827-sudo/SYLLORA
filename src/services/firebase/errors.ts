export function firebaseErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code: unknown }).code) : '';
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'Your browser blocked the Google sign-in popup.',
    'auth/network-request-failed': 'Unable to reach Firebase. Check your internet connection.',
    'auth/requires-recent-login': 'Please sign in again before changing your email.',
    'permission-denied': 'Firebase denied this operation. Check your Firestore Security Rules.',
  };
  return messages[code] ?? (error instanceof Error ? error.message : 'Something went wrong. Please try again.');
}
