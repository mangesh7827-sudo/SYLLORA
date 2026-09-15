import { useId, type SelectHTMLAttributes } from 'react';
type Props = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string };
export function Select({ id, label, error, className = '', ...props }: Props) {
  const generatedId = useId();
  const selectId = id ?? `select-${generatedId}`;
  return <div className="ui-field">{label && <label htmlFor={selectId}>{label}</label>}<select id={selectId} aria-invalid={Boolean(error)} aria-describedby={error ? `${selectId}-message` : undefined} className={`ui-input ${className}`.trim()} {...props} />{error && <p id={`${selectId}-message`} className="ui-field__message ui-field__message--error" role="alert">{error}</p>}</div>;
}
