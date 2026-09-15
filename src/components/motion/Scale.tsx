import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & { duration?: 'fast' | 'normal' | 'slow' };

export function Scale({ duration = 'normal', className = '', ...props }: Props) {
  return <div className={`motion-scale motion-scale--${duration} ${className}`.trim()} {...props} />;
}
