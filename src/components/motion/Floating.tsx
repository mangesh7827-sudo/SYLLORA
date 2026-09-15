import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & { speed?: 'slow' | 'normal' };

export function Floating({ speed = 'slow', className = '', ...props }: Props) {
  return <div className={`motion-floating motion-floating--${speed} ${className}`.trim()} {...props} />;
}
