import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { AcademicTargetPicker } from './RevisionTargetPicker';
import type { RevisionRecord, StudySession } from '@/types';
import type { RevisionInput } from '../types/productivity';
import { useAuth } from '@/app/providers/AuthContext';
import { studyService } from '../services/studyService';
import { formatDurationShort } from '../utils/time';
import { formatDateTime } from '../utils/formatters';

interface Props { initial?: Partial<RevisionRecord>; busy: boolean; error: string | null; onCancel: () => void; onSubmit: (input: RevisionInput) => void; }
function toLocalInput(value?: string) { if (!value) return ''; const date = new Date(value); const pad = (n: number) => String(n).padStart(2, '0'); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`; }
export function RevisionForm({ initial, busy, error, onCancel, onSubmit }: Props) {
  const { currentUser } = useAuth();
  const [target, setTarget] = useState<{ subjectId?: string; moduleId?: string; topicId?: string }>({ subjectId: initial?.subjectId, moduleId: initial?.moduleId, topicId: initial?.topicId });
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [revisedAt, setRevisedAt] = useState(toLocalInput(initial?.revisedAt) || toLocalInput(new Date().toISOString()));
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [studySessionId, setStudySessionId] = useState(initial?.studySessionId ?? '');
  useEffect(() => { if (!currentUser?.id) return; void studyService.getSessions(currentUser.id).then(setSessions).catch(() => setSessions([])); }, [currentUser?.id]);
  return <form className="productivity-form" onSubmit={(event) => { event.preventDefault(); onSubmit({ subjectId: target.subjectId ?? '', moduleId: target.moduleId, topicId: target.topicId, revisedAt: new Date(revisedAt).toISOString(), notes, studySessionId: studySessionId || undefined }); }}>
    <AcademicTargetPicker value={target} onChange={setTarget} disabled={busy} />
    <div className="productivity-two-column"><div className="ui-field"><label htmlFor="revision-date">Revision date &amp; time</label><input id="revision-date" className="ui-input" type="datetime-local" value={revisedAt} onChange={(event) => setRevisedAt(event.target.value)} disabled={busy} required /></div></div>
    <div className="ui-field"><label htmlFor="revision-study-session">Study session (optional)</label><select id="revision-study-session" className="ui-input" value={studySessionId} onChange={(event) => setStudySessionId(event.target.value)} disabled={busy}><option value="">No linked session</option>{sessions.slice(0, 12).map((session) => <option key={session.id} value={session.id}>{formatDateTime(session.startedAt)} · {formatDurationShort(session.durationSeconds)}</option>)}</select></div>
    <Textarea label="Notes (optional)" value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="What did you revise?" disabled={busy} />
    {error && <p className="productivity-inline-error" role="alert">{error}</p>}
    <div className="academic-form__actions"><Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : initial?.id ? 'Save changes' : 'Add revision'}</Button></div>
  </form>;
}
