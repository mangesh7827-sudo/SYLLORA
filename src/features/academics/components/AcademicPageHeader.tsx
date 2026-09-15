import type { ReactNode } from 'react';
interface Props { eyebrow?: string; title: string; description?: string; action?: ReactNode; }
export function AcademicPageHeader({ eyebrow = 'Academics', title, description, action }: Props) {
  return <header className="academic-page-header"><div><p className="academic-eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="academic-page-header__action">{action}</div>}</header>;
}
