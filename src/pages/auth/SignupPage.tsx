import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StateView } from '@/components/ui/StateView';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { PasswordField } from '@/components/auth/PasswordField';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { useAuth } from '@/app/providers/AuthContext';
import { routePaths } from '@/app/routes/routePaths';

function validEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

export function SignupPage() {
  const { signup, googleLogin, error, clearError, isLoading } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => { clearError(); }, [clearError]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    clearError();
    const next: Record<string, string | undefined> = {};
    const trimmedNickname = nickname.trim();
    const normalizedEmail = email.trim();
    if (!trimmedNickname) next.nickname = 'Enter a nickname.';
    else if (trimmedNickname.length < 2 || trimmedNickname.length > 40) next.nickname = 'Nickname must be between 2 and 40 characters.';
    if (!normalizedEmail) next.email = 'Enter your email address.';
    else if (!validEmail(normalizedEmail)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Create a password.';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (!confirmPassword) next.confirmPassword = 'Confirm your password.';
    else if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    try {
      await signup({ nickname: trimmedNickname, email: normalizedEmail, password, confirmPassword });
      setPassword(''); setConfirmPassword('');
      navigate(routePaths.dashboard, { replace: true });
    } catch {
      setPassword(''); setConfirmPassword('');
    } finally { setSubmitting(false); }
  };

  const handleGoogle = async () => {
    if (googleLoading || submitting) return;
    clearError(); setGoogleLoading(true);
    try { await googleLogin(); navigate(routePaths.dashboard, { replace: true }); }
    catch { /* Provider is intentionally unavailable until backend OAuth is connected. */ }
    finally { setGoogleLoading(false); }
  };

  return (
    <AuthPageShell title="Create your account" description="Set up your Syllora profile and keep your academic work organized." footer={<>Already have an account? <Link to={routePaths.login}>Sign in</Link></>}>
      <form className="auth-form" onSubmit={submit} noValidate>
        <Input id="signup-nickname" label="Nickname" value={nickname} onChange={(event) => setNickname(event.target.value)} autoComplete="nickname" maxLength={40} placeholder="What should Syllora call you?" error={errors.nickname} disabled={submitting || isLoading} />
        <Input id="signup-email" label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" inputMode="email" placeholder="you@example.com" error={errors.email} disabled={submitting || isLoading} />
        <PasswordField id="signup-password" label="Password" value={password} onChange={setPassword} autoComplete="new-password" placeholder="At least 8 characters" error={errors.password} disabled={submitting || isLoading} />
        <PasswordField id="signup-confirm-password" label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" placeholder="Re-enter your password" error={errors.confirmPassword} disabled={submitting || isLoading} />
        <p className="auth-helper">Use at least 8 characters. Your password is never persisted as plaintext.</p>
        {error && <StateView state="error" message={error} />}
        <Button type="submit" size="lg" className="auth-submit" disabled={submitting || isLoading}>{submitting ? 'Creating account…' : 'Create account'}</Button>
        <div className="auth-divider" aria-hidden="true"><span>or</span></div>
        <GoogleAuthButton onClick={handleGoogle} loading={googleLoading} disabled={submitting || isLoading} />
      </form>
    </AuthPageShell>
  );
}
