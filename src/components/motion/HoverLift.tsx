import type { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & { intensity?: 'subtle' | 'medium' };

export function HoverLift({ intensity = 'subtle', className = '', ...props }: Props) {
  return <div className={`motion-hover-lift motion-hover-lift--${intensity} ${className}`.trim()} {...props} />;
}
