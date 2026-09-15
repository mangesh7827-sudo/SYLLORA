import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/icons/Icon';
import { TimerDisplay } from './TimerDisplay';
import { StudyTargetPicker } from './StudyTargetPicker';
import { useStudyTimer } from '../hooks/useStudyTimer';
import { formatDuration, formatDurationShort } from '../utils/time';
import type { StudySessionInput } from '../types/productivity';
import { AcademicModal } from '@/features/academics/components/AcademicModal';
import { ConfirmDialog } from '@/features/academics/components/ConfirmDialog';
import { Textarea } from '@/components/ui/Textarea';
import { useAcademicCatalog } from '../hooks/useAcademicCatalog';

export function StudyTimerPanel({ compact = false, onSaved }: { compact?: boolean; onSaved?: () => void }) {
  const timer = useStudyTimer();
  const { subjects, modules, topics } = useAcademicCatalog();
  const [startOpen, setStartOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [target, setTarget] = useState<Partial<StudySessionInput>>({ targetType: 'SUBJECT' });
  const [notes, setNotes] = useState('');

  const start = async () => { await timer.start({ targetType: target.targetType ?? 'SUBJECT', subjectId: target.subjectId, moduleId: target.moduleId, topicId: target.topicId, extraTaskLabel: target.extraTaskLabel, notes }); setStartOpen(false); setNotes(''); };
  const save = async (input: Partial<StudySessionInput>) => { await timer.complete({ ...input, notes }); setSaveOpen(false); setNotes(''); onSaved?.(); };
  const cancel = async () => { await timer.cancel(); setCancelOpen(false); onSaved?.(); };

  if (timer.loading) return <Card className="study-timer-card"><p>Loading study timer…</p></Card>;
  if (!timer.activeSession) return <Card variant="floating" className={`study-timer-card${compact ? ' study-timer-card--compact' : ''}`}>
    <div className="study-timer-card__heading"><div><p className="academic-eyebrow">Study timer</p><h2>No study session running</h2><p>Choose what you want to study and start tracking time.</p></div><span className="study-timer-card__icon"><Icon name="stopwatch" /></span></div>
    {timer.error && <p className="productivity-inline-error" role="alert">{timer.error}</p>}
    <Button size="lg" onClick={() => setStartOpen(true)}><Icon name="stopwatch" />Start Study</Button>
    <AcademicModal open={startOpen} title="Start study session" description="Choose an academic target before the timer starts." onClose={() => { if (!timer.busy) setStartOpen(false); }}>
      <div className="productivity-form"><StudyTargetPicker value={target} onChange={setTarget} disabled={timer.busy} /><Textarea label="Notes (optional)" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="What are you focusing on?" /><div className="academic-form__actions"><Button variant="ghost" onClick={() => setStartOpen(false)} disabled={timer.busy}>Cancel</Button><Button onClick={() => void start()} disabled={timer.busy}>{timer.busy ? 'Starting…' : 'Start Study'}</Button></div></div>
    </AcademicModal>
  </Card>;

  const status = timer.activeSession.status;
  const saveTarget: Partial<StudySessionInput> = { targetType: timer.activeSession.targetType, subjectId: timer.activeSession.subjectId, moduleId: timer.activeSession.moduleId, topicId: timer.activeSession.topicId, extraTaskLabel: timer.activeSession.extraTaskLabel };
  const subjectName = timer.activeSession.subjectId ? subjects.find((item) => item.id === timer.activeSession?.subjectId)?.name : undefined;
  const moduleName = timer.activeSession.moduleId ? modules.find((item) => item.id === timer.activeSession?.moduleId)?.name : undefined;
  const topicName = timer.activeSession.topicId ? topics.find((item) => item.id === timer.activeSession?.topicId)?.name : undefined;
  const currentTargetLabel = timer.activeSession.targetType === 'EXTRA_TASK' ? timer.activeSession.extraTaskLabel || 'Extra learning' : topicName ?? moduleName ?? subjectName ?? 'Academic target';
  return <Card variant="floating" className={`study-timer-card study-timer-card--active${compact ? ' study-timer-card--compact' : ''}`}>
    <div className="study-timer-card__heading"><div><p className="academic-eyebrow">Currently studying</p><h2>{currentTargetLabel}</h2><p>{topicName && moduleName ? `${moduleName} · ${topicName}` : moduleName || subjectName || 'Study session active'}</p></div><Badge status={status === 'RUNNING' ? 'in-progress' : 'pending'}>{status === 'RUNNING' ? 'Running' : 'Paused'}</Badge></div>
    <TimerDisplay seconds={timer.elapsedSeconds} status={status} />
    <p className="study-timer-card__duration">{formatDurationShort(timer.elapsedSeconds)} tracked so far. Paused time is excluded.</p>
    {timer.error && <p className="productivity-inline-error" role="alert">{timer.error}</p>}
    <div className="study-timer-card__actions">
      {status === 'RUNNING' ? <Button onClick={() => void timer.pause()} disabled={timer.busy}>Pause</Button> : <Button onClick={() => void timer.resume()} disabled={timer.busy}>Resume</Button>}
      <Button variant="success" onClick={() => { setTarget(saveTarget); setNotes(timer.activeSession?.notes ?? ''); setSaveOpen(true); }} disabled={timer.busy}>Stop &amp; Save</Button>
      <Button variant="ghost" onClick={() => setCancelOpen(true)} disabled={timer.busy}>Cancel</Button>
    </div>
    <AcademicModal open={saveOpen} title="Save study session" description="The duration comes from the timestamp-based timer." onClose={() => { if (!timer.busy) setSaveOpen(false); }}>
      <div className="productivity-form"><StudyTargetPicker value={target} onChange={setTarget} disabled={timer.busy} /><Textarea label="Notes (optional)" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Add a short note about this session." /><div className="study-save-duration"><span>Recorded duration</span><strong>{formatDuration(timer.elapsedSeconds)}</strong></div><div className="academic-form__actions"><Button variant="ghost" onClick={() => setSaveOpen(false)} disabled={timer.busy}>Keep timer</Button><Button variant="success" onClick={() => void save(target)} disabled={timer.busy}>{timer.busy ? 'Saving…' : 'Save session'}</Button></div></div>
    </AcademicModal>
    <ConfirmDialog open={cancelOpen} title="Cancel study session?" message="This session will not be counted as completed study time." busy={timer.busy} onCancel={() => setCancelOpen(false)} onConfirm={() => void cancel()} />
  </Card>;
}
