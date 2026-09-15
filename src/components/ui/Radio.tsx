import { useId, type InputHTMLAttributes } from 'react';
type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label?: string };
export function Radio({ id, label, ...props }: Props) {
  const generatedId = useId();
  const inputId = id ?? `radio-${generatedId}`;
  return <label className="ui-check" htmlFor={inputId}><input id={inputId} type="radio" {...props} />{label && <span>{label}</span>}</label>;
}
