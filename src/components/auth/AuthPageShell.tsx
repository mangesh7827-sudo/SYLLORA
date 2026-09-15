import type { PropsWithChildren, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { HoverLift } from '@/components/motion/HoverLift';
import { Fade } from '@/components/motion/Fade';
import { routePaths } from '@/app/routes/routePaths';

interface AuthPageShellProps extends PropsWithChildren {
  title: string;
  description: string;
  footer: ReactNode;
}

export function AuthPageShell({ title, description, footer, children }: AuthPageShellProps) {
  return (
    <main className="auth-page">
      <div className="auth-page__backdrop" aria-hidden="true" />
      <Fade duration="normal">
        <div className="auth-page__content">
          <Link to={routePaths.login} className="auth-brand" aria-label="Syllora sign in">
            <span className="auth-brand__mark">S</span>
            <span>Syllora</span>
          </Link>
          <HoverLift intensity="subtle" className="auth-page__lift">
            <Card variant="elevated" className="auth-card">
              <header className="auth-card__header">
                <p className="auth-eyebrow">Syllora account</p>
                <h1>{title}</h1>
                <p>{description}</p>
              </header>
              {children}
              <footer className="auth-card__footer">{footer}</footer>
            </Card>
          </HoverLift>
          <p className="auth-page__security-note">Your academic workspace stays separate from authentication credentials.</p>
        </div>
      </Fade>
    </main>
  );
}
