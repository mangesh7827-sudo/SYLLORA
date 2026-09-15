import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StateView } from '@/components/ui/StateView';
import { Icon } from '@/components/icons/Icon';
import { ConfirmDialog } from '@/features/academics/components/ConfirmDialog';
import { studyService } from '../services/studyService';
import type { StudySession } from '@/types';
import type { SubjectSummary, ModuleSummary } from '@/features/academics/types/academic';
import type { Topic } from '@/types';
import { formatDateTime } from '../utils/formatters';
import { formatDurationShort } from '../utils/time';

function labelFor(session: StudySession, subjects: SubjectSummary[], modules: ModuleSummary[], topics: Topic[]) {
  if (session.targetType === 'EXTRA_TASK') return session.extraTaskLabel || 'Extra learning';
  if (session.topicId) return topics.find((item) => item.id === session.topicId)?.name ?? 'Topic';
  if (session.moduleId) return modules.find((item) => item.id === session.moduleId)?.name ?? 'Module';
  return subjects.find((item) => item.id === session.subjectId)?.name ?? 'Subject';
}

interface Props { sessions: StudySession[]; subjects: SubjectSummary[]; modules: ModuleSummary[]; topics: Topic[]; onChanged: () => void; loading?: boolean; }
export function StudySessionList({ sessions, subjects, modules, topics, onChanged, loading = false }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<StudySession | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  const visible = useMemo(() => sessions.filter((session) => session.status === 'COMPLETED'), [sessions]);
  const remove = async () => { if (!deleteTarget) return; setBusy(true); setError(null); try { await studyService.deleteSession(deleteTarget.userId, deleteTarget.id); setDeleteTarget(null); onChanged(); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to delete this session.'); } finally { setBusy(false); } };
  if (loading) return <Card><StateView state="loading" message="Loading study history…" /></Card>;
  if (!visible.length) return <Card className="productivity-empty"><StateView state="empty" message="No study sessions yet. Start your first session and Syllora will begin tracking your study time." /></Card>;
  return <Card className="study-history-card"><div className="productivity-list-header"><div><p className="academic-eyebrow">History</p><h2>Recent study sessions</h2></div><span>{visible.length} completed</span></div>{error && <p className="productivity-inline-error" role="alert">{error}</p>}<ul className="productivity-list">{visible.map((session) => <li key={session.id} className="study-history-item"><div className="study-history-item__main"><span className="study-history-item__icon" aria-hidden="true"><Icon name="clock" /></span><div><strong>{labelFor(session, subjects, modules, topics)}</strong><small>{session.moduleId ? modules.find((item) => item.id === session.moduleId)?.name : session.subjectId ? subjects.find((item) => item.id === session.subjectId)?.name : 'Extra learning'} · {formatDateTime(session.startedAt)}</small>{session.notes && <p>{session.notes}</p>}</div></div><div className="study-history-item__meta"><Badge status="completed">Completed</Badge><strong>{formatDurationShort(session.durationSeconds)}</strong><Button variant="ghost" size="sm" onClick={() => setDeleteTarget(session)} aria-label={`Delete study session from ${formatDateTime(session.startedAt)}`}><Icon name="trash" /></Button></div></li>)}</ul><ConfirmDialog open={Boolean(deleteTarget)} title="Delete study session?" message="This completed session will be permanently removed from your study history." busy={busy} onCancel={() => { if (!busy) setDeleteTarget(null); }} onConfirm={() => void remove()} /></Card>;
}
