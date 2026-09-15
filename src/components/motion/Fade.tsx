import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & { duration?: 'fast' | 'normal' | 'slow' };

export function Fade({ duration = 'normal', className = '', ...props }: Props) {
  return <div className={`motion-fade motion-fade--${duration} ${className}`.trim()} {...props} />;
}
