import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & { intensity?: 'subtle' | 'medium' };

export function PressEffect({ intensity = 'subtle', className = '', ...props }: Props) {
  return <div className={`motion-press motion-press--${intensity} ${className}`.trim()} {...props} />;
}
