import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/icons/Icon';
import { Fade } from '@/components/motion';

interface Props { open: boolean; title: string; description?: string; onClose: () => void; children: ReactNode; }
export function AcademicModal({ open, title, description, onClose, children }: Props) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusable = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? []);
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const elements = focusable(); if (elements.length === 0) return;
      const first = elements[0]; const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="academic-modal__backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <Fade duration="fast"><div ref={dialogRef} className="academic-modal ui-motion-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}>
      <div className="academic-modal__header"><div><h2 id={titleId}>{title}</h2>{description && <p id={descriptionId}>{description}</p>}</div><Button variant="icon" size="sm" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></Button></div>
      {children}
    </div></Fade>
  </div>;
}
