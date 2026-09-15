import { useLocation } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

export function PageTransition({ children }: PropsWithChildren) {
  const location = useLocation();
  return <div key={location.pathname} className="motion-page-transition">{children}</div>;
}
