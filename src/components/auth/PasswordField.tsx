import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function PasswordField({ id, label, value, onChange, autoComplete, error, placeholder, disabled = false }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-password-field">
      <Input
        id={id}
        label={label}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        error={error}
        inputClassName="auth-password-field__input"
        disabled={disabled}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="auth-password-field__toggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        aria-pressed={visible}
        disabled={disabled}
      >
        {visible ? 'Hide' : 'Show'}
      </Button>
    </div>
  );
}
