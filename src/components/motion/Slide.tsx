import type { HTMLAttributes } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';
type Props = HTMLAttributes<HTMLDivElement> & { direction?: Direction; duration?: 'fast' | 'normal' | 'slow' };

export function Slide({ direction = 'up', duration = 'normal', className = '', ...props }: Props) {
  return <div className={`motion-slide motion-slide--${direction} motion-slide--${duration} ${className}`.trim()} {...props} />;
}
