import { useId, type InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; success?: string; inputClassName?: string };

export function Input({ id, label, error, success, inputClassName = '', className = '', ...props }: Props) {
  const generatedId = useId();
  const inputId = id ?? `input-${generatedId}`;
  const messageId = `${inputId}-message`;
  return <div className={`ui-field ${className}`.trim()}>
    {label && <label htmlFor={inputId}>{label}</label>}
    <input id={inputId} className={inputClassName} aria-invalid={Boolean(error)} aria-describedby={error || success ? messageId : undefined} {...props} />
    {error && <p id={messageId} className="ui-field__message ui-field__message--error" role="alert">{error}</p>}
    {!error && success && <p id={messageId} className="ui-field__message ui-field__message--success">{success}</p>}
  </div>;
}
