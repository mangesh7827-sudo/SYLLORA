import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { StateView } from '@/components/ui/StateView';
import { Icon } from '@/components/icons/Icon';
import { useAuth } from '@/app/providers/AuthContext';
import { academicService } from '../services/academicService';
import type { AcademicProgress, SubjectInput, SubjectSummary } from '../types/academic';
import { formatProgress } from '../types/academic';
import { AcademicPageHeader } from '../components/AcademicPageHeader';
import { SubjectCard } from '../components/SubjectCard';
import { AcademicModal } from '../components/AcademicModal';
import { SubjectForm } from '../components/AcademicForm';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function SubjectsPage() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id ?? '';
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [overall, setOverall] = useState<AcademicProgress | null>(null);
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SubjectSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubjectSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setState('loading'); setError(null);
    try { const [nextSubjects, nextOverall] = await Promise.all([academicService.getSubjects(userId), academicService.getOverallProgress(userId)]); setSubjects(nextSubjects); setOverall(nextOverall); setState('success'); }
    catch { setError('We could not load your subjects. Please try again.'); setState('error'); }
  }, [userId]);
  useEffect(() => { void load(); }, [load]);

  const submit = async (input: SubjectInput) => { setBusy(true); setFeedback(null); try { if (editing) await academicService.updateSubject(userId, editing.id, input); else await academicService.createSubject(userId, input); setFormOpen(false); setEditing(null); setFeedback(editing ? 'Subject updated.' : 'Subject created.'); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'We could not save the subject.'); } finally { setBusy(false); } };
  const remove = async () => { if (!deleteTarget) return; setBusy(true); try { await academicService.deleteSubject(userId, deleteTarget.id); setDeleteTarget(null); setFeedback('Subject deleted.'); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'We could not delete the subject.'); } finally { setBusy(false); } };

  return <div className="academic-page">
    <AcademicPageHeader title="Subjects" description="Organize your academic work into subjects, modules, and topics." action={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Icon name="plus" />Add subject</Button>} />
    {feedback && <p className="academic-feedback" role="status">{feedback}</p>}
    {overall && <Card variant="highlighted" className="academic-overview"><div><p className="academic-eyebrow">Overall academic progress</p><strong>{formatProgress(overall.overallPercentage)}</strong><span>{overall.completedTopics} of {overall.totalTopics} topics completed</span></div><Progress value={overall.overallPercentage} label="Overall topic completion" /></Card>}
    {state === 'loading' && <Card><StateView state="loading" message="Loading subjects…" /></Card>}
    {state === 'error' && <Card><div className="academic-error"><StateView state="error" message={error ?? 'Something went wrong.'} /><Button variant="outline" onClick={() => void load()}>Try again</Button></div></Card>}
    {state === 'success' && subjects.length === 0 && <Card className="academic-empty"><StateView state="empty" message="Create your first subject." /><Button onClick={() => setFormOpen(true)}><Icon name="plus" />Add subject</Button></Card>}
    {state === 'success' && subjects.length > 0 && <section className="academic-grid" aria-label="Subjects">{subjects.map((subject) => <SubjectCard key={subject.id} subject={subject} onEdit={(item) => { setEditing(item); setFormOpen(true); }} onDelete={setDeleteTarget} />)}</section>}
    <AcademicModal open={formOpen} title={editing ? 'Edit subject' : 'Add subject'} description={editing ? 'Update the subject details without affecting its modules or topics.' : 'Create a subject to start building your academic hierarchy.'} onClose={() => { if (!busy) { setFormOpen(false); setEditing(null); } }}><SubjectForm initial={editing ?? undefined} busy={busy} error={error} onCancel={() => { setFormOpen(false); setEditing(null); }} onSubmit={(input) => void submit(input)} /></AcademicModal>
    <ConfirmDialog open={Boolean(deleteTarget)} title="Delete subject?" message="This will remove the subject and its associated academic content. The backend will ultimately control cascade behavior." busy={busy} onCancel={() => { if (!busy) setDeleteTarget(null); }} onConfirm={() => void remove()} />
  </div>;
}
