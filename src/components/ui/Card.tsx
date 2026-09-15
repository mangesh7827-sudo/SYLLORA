import type { HTMLAttributes } from 'react';

type Variant = 'default' | 'elevated' | 'interactive' | 'floating' | 'compact' | 'highlighted';
type Props = HTMLAttributes<HTMLDivElement> & { variant?: Variant };

export function Card({ variant = 'default', className = '', ...props }: Props) {
  return <div className={`ui-card ui-card--${variant} ${className}`.trim()} {...props} />;
}
