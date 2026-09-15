import { Button } from '@/components/ui/Button';

interface GoogleAuthButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function GoogleAuthButton({ onClick, loading = false, disabled = false }: GoogleAuthButtonProps) {
  return (
    <Button type="button" variant="outline" size="lg" className="auth-google-button" onClick={onClick} disabled={disabled || loading}>
      <span className="auth-google-button__mark" aria-hidden="true">G</span>
      {loading ? 'Connecting…' : 'Continue with Google'}
    </Button>
  );
}
