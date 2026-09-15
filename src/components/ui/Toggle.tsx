import { useId, type InputHTMLAttributes } from 'react';
type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label?: string };
export function Toggle({ id, label, ...props }: Props) {
  const generatedId = useId();
  const inputId = id ?? `toggle-${generatedId}`;
  return <label className="ui-toggle" htmlFor={inputId}><input id={inputId} type="checkbox" role="switch" {...props} /><span className="ui-toggle__track" aria-hidden="true"><span /></span>{label && <span>{label}</span>}</label>;
}
