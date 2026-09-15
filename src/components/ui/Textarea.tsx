import { useId, type TextareaHTMLAttributes } from 'react';
type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string };
export function Textarea({ id, label, error, ...props }: Props) {
  const generatedId = useId();
  const textareaId = id ?? `textarea-${generatedId}`;
  return <div className="ui-field">{label && <label htmlFor={textareaId}>{label}</label>}<textarea id={textareaId} aria-invalid={Boolean(error)} aria-describedby={error ? `${textareaId}-message` : undefined} className="ui-input ui-textarea" {...props} />{error && <p id={`${textareaId}-message`} className="ui-field__message ui-field__message--error" role="alert">{error}</p>}</div>;
}
