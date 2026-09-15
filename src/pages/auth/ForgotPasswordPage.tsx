import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StateView } from '@/components/ui/StateView';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { useAuth } from '@/app/providers/AuthContext';
import { routePaths } from '@/app/routes/routePaths';

function validEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

export function ForgotPasswordPage() {
  const { requestPasswordReset, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { clearError(); }, [clearError]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError(); setEmailError(undefined);
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return setEmailError('Enter your email address.');
    if (!validEmail(normalizedEmail)) return setEmailError('Enter a valid email address.');
    setSubmitting(true);
    try { await requestPasswordReset(normalizedEmail); }
    catch { /* The development service reports that backend recovery is not connected. */ }
    finally { setSubmitting(false); }
  };

  return (
    <AuthPageShell title="Reset your password" description="Enter your email to begin the password recovery process." footer={<>Remembered your password? <Link to={routePaths.login}>Back to sign in</Link></>}>
      <form className="auth-form" onSubmit={submit} noValidate>
        <Input id="forgot-email" label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" inputMode="email" placeholder="you@example.com" error={emailError} disabled={submitting} />
        {error && <StateView state="error" message={error} />}
        <Button type="submit" size="lg" className="auth-submit" disabled={submitting}>{submitting ? 'Sending…' : 'Continue'}</Button>
      </form>
    </AuthPageShell>
  );
}
