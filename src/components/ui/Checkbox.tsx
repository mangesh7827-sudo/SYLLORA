import { useId, type InputHTMLAttributes } from 'react';
type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label?: string };
export function Checkbox({ id, label, ...props }: Props) {
  const generatedId = useId();
  const inputId = id ?? `checkbox-${generatedId}`;
  return <label className="ui-check" htmlFor={inputId}><input id={inputId} type="checkbox" {...props} />{label && <span>{label}</span>}</label>;
}
