import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StateView } from '@/components/ui/StateView';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { PasswordField } from '@/components/auth/PasswordField';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { useAuth } from '@/app/providers/AuthContext';
import { routePaths } from '@/app/routes/routePaths';

function validEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function returnPath(location: Location) {
  const from = location.state as { from?: Location } | null;
  const target = from?.from;
  if (!target?.pathname || target.pathname === routePaths.login || target.pathname === routePaths.signup) return routePaths.dashboard;
  return `${target.pathname}${target.search}${target.hash}`;
}

export function LoginPage() {
  const { login, googleLogin, error, clearError, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => { clearError(); }, [clearError]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setEmailError(undefined); setPasswordError(undefined); clearError();
    const normalizedEmail = email.trim();
    let valid = true;
    if (!normalizedEmail) { setEmailError('Enter your email address.'); valid = false; }
    else if (!validEmail(normalizedEmail)) { setEmailError('Enter a valid email address.'); valid = false; }
    if (!password) { setPasswordError('Enter your password.'); valid = false; }
    if (!valid) return;

    setSubmitting(true);
    try {
      await login({ email: normalizedEmail, password });
      setPassword('');
      navigate(returnPath(location), { replace: true });
    } catch {
      setPassword('');
    } finally { setSubmitting(false); }
  };

  const handleGoogle = async () => {
    if (googleLoading || submitting) return;
    clearError(); setGoogleLoading(true);
    try { await googleLogin(); navigate(returnPath(location), { replace: true }); }
    catch { /* AuthProvider exposes the safe user-facing error. */ }
    finally { setGoogleLoading(false); }
  };

  return (
    <AuthPageShell title="Welcome back" description="Sign in to continue to your Syllora workspace." footer={<>New to Syllora? <Link to={routePaths.signup}>Create an account</Link></>}>
      <form className="auth-form" onSubmit={submit} noValidate>
        <Input id="login-email" label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" inputMode="email" placeholder="you@example.com" error={emailError} disabled={submitting || isLoading} />
        <PasswordField id="login-password" label="Password" value={password} onChange={setPassword} autoComplete="current-password" placeholder="Enter your password" error={passwordError} disabled={submitting || isLoading} />
        <div className="auth-form__row auth-form__row--end"><Link to={routePaths.forgotPassword}>Forgot password?</Link></div>
        {error && <StateView state="error" message={error} />}
        <Button type="submit" size="lg" className="auth-submit" disabled={submitting || isLoading}>{submitting ? 'Signing in…' : 'Sign in'}</Button>
        <div className="auth-divider" aria-hidden="true"><span>or</span></div>
        <GoogleAuthButton onClick={handleGoogle} loading={googleLoading} disabled={submitting || isLoading} />
      </form>
    </AuthPageShell>
  );
}
