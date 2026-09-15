import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/icons/Icon';
import { StateView } from '@/components/ui/StateView';
import { ConfirmDialog } from '@/features/academics/components/ConfirmDialog';
import { revisionService } from '../services/revisionService';
import { formatDateTime } from '../utils/formatters';
import type { RevisionRecord } from '@/types';
import type { SubjectSummary, ModuleSummary } from '@/features/academics/types/academic';
import type { Topic } from '@/types';

function label(record: RevisionRecord, subjects: SubjectSummary[], modules: ModuleSummary[], topics: Topic[]) { const topic = record.topicId ? topics.find((item) => item.id === record.topicId)?.name : undefined; const module = record.moduleId ? modules.find((item) => item.id === record.moduleId)?.name : undefined; const subject = subjects.find((item) => item.id === record.subjectId)?.name ?? 'Subject'; return topic ? `${subject} · ${module ?? 'Module'} · ${topic}` : module ? `${subject} · ${module}` : subject; }
export function RevisionList({ records, subjects, modules, topics, onChanged, onEdit, loading }: { records: RevisionRecord[]; subjects: SubjectSummary[]; modules: ModuleSummary[]; topics: Topic[]; onChanged: () => void; onEdit: (record: RevisionRecord) => void; loading: boolean }) {
  const [deleteTarget, setDeleteTarget] = useState<RevisionRecord | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  const remove = async () => { if (!deleteTarget) return; setBusy(true); try { await revisionService.deleteRevision(deleteTarget.userId, deleteTarget.id); setDeleteTarget(null); onChanged(); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to delete this revision.'); } finally { setBusy(false); } };
  if (loading) return <Card><StateView state="loading" message="Loading revision history…" /></Card>;
  if (!records.length) return <Card className="productivity-empty"><StateView state="empty" message="No revision records yet. Record your first revision activity." /></Card>;
  return <Card><div className="productivity-list-header"><div><p className="academic-eyebrow">History</p><h2>Recent revisions</h2></div><span>{records.length} records</span></div>{error && <p className="productivity-inline-error" role="alert">{error}</p>}<ul className="productivity-list">{records.map((record) => <li className="revision-item" key={record.id}><div><strong>{label(record, subjects, modules, topics)}</strong><small>{formatDateTime(record.revisedAt)}{record.studySessionId ? ' · Linked to study session' : ''}</small>{record.notes && <p>{record.notes}</p>}</div><div className="revision-item__actions"><Button variant="ghost" size="sm" onClick={() => onEdit(record)} aria-label={`Edit revision from ${formatDateTime(record.revisedAt)}`}><Icon name="settings" /></Button><Button variant="ghost" size="sm" onClick={() => setDeleteTarget(record)} aria-label={`Delete revision from ${formatDateTime(record.revisedAt)}`}><Icon name="trash" /></Button></div></li>)}</ul><ConfirmDialog open={Boolean(deleteTarget)} title="Delete revision?" message="This revision record will be permanently removed from your history." busy={busy} onCancel={() => { if (!busy) setDeleteTarget(null); }} onConfirm={() => void remove()} /></Card>;
}
