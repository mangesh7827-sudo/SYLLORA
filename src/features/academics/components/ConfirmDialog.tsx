import { Button } from '@/components/ui/Button';
import { AcademicModal } from './AcademicModal';

interface Props { open: boolean; title: string; message: string; busy?: boolean; onCancel: () => void; onConfirm: () => void; }
export function ConfirmDialog({ open, title, message, busy = false, onCancel, onConfirm }: Props) {
  return <AcademicModal open={open} title={title} description={message} onClose={onCancel}>
    <div className="academic-confirm"><div className="academic-confirm__actions"><Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button><Button type="button" variant="danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : 'Delete'}</Button></div></div>
  </AcademicModal>;
}
