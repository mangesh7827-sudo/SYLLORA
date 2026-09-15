import type { CSSProperties } from 'react';
type Props = { value: number; label?: string; showValue?: boolean; size?: 'sm' | 'md'; variant?: 'bar' | 'circular'; };
export function Progress({ value, label, showValue = true, size = 'md', variant = 'bar' }: Props) {
  const safeValue = Math.min(100, Math.max(0, value));
  if (variant === 'circular') return <div className={`ui-progress-circle ui-progress-circle--${size}`} role="progressbar" aria-label={label ?? 'Progress'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue} style={{ '--progress': safeValue } as CSSProperties}><span>{showValue ? `${safeValue}%` : null}</span>{label && <small>{label}</small>}</div>;
  return <div className={`ui-progress ui-progress--${size}`} aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue} role="progressbar">{(label || showValue) && <div className="ui-progress__meta">{label && <span>{label}</span>}{showValue && <span>{safeValue}%</span>}</div>}<div className="ui-progress__track"><div className="ui-progress__bar" style={{ width: `${safeValue}%` }} /></div></div>;
}
