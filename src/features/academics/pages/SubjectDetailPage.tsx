import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { StateView } from '@/components/ui/StateView';
import { Icon } from '@/components/icons/Icon';
import { routePaths } from '@/app/routes/routePaths';
import { useAuth } from '@/app/providers/AuthContext';
import { academicService } from '../services/academicService';
import type { ModuleInput, ModuleSummary, SubjectSummary } from '../types/academic';
import { formatProgress } from '../types/academic';
import { AcademicPageHeader } from '../components/AcademicPageHeader';
import { ModuleCard } from '../components/ModuleCard';
import { AcademicModal } from '../components/AcademicModal';
import { ModuleForm } from '../components/AcademicForm';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function SubjectDetailPage() {
  const { subjectId } = useParams(); const navigate = useNavigate(); const { currentUser } = useAuth(); const userId = currentUser?.id ?? '';
  const [subject, setSubject] = useState<SubjectSummary | null>(null); const [modules, setModules] = useState<ModuleSummary[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [formOpen, setFormOpen] = useState(false); const [editing, setEditing] = useState<ModuleSummary | null>(null); const [deleteTarget, setDeleteTarget] = useState<ModuleSummary | null>(null); const [busy, setBusy] = useState(false); const [feedback, setFeedback] = useState<string | null>(null);
  const load = useCallback(async () => { if (!userId || !subjectId) return; setLoading(true); setError(null); try { const nextSubject = await academicService.getSubject(userId, subjectId); if (!nextSubject) { setError('Subject not found.'); setSubject(null); return; } const nextModules = await academicService.getModules(userId, subjectId); setSubject(nextSubject); setModules(nextModules); } catch { setError('We could not load this subject.'); } finally { setLoading(false); } }, [subjectId, userId]);
  useEffect(() => { void load(); }, [load]);
  const submit = async (input: ModuleInput) => { setBusy(true); try { if (editing) await academicService.updateModule(userId, editing.id, input); else await academicService.createModule(userId, subjectId!, input); setFormOpen(false); setEditing(null); setFeedback(editing ? 'Module updated.' : 'Module created.'); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'We could not save the module.'); } finally { setBusy(false); } };
  const remove = async () => { if (!deleteTarget) return; setBusy(true); try { await academicService.deleteModule(userId, deleteTarget.id); setDeleteTarget(null); setFeedback('Module deleted.'); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'We could not delete the module.'); } finally { setBusy(false); } };
  if (loading) return <Card><StateView state="loading" message="Loading subject…" /></Card>;
  if (!subject) return <Card className="academic-error"><StateView state="error" message={error ?? 'Subject not found.'} /><Button variant="outline" onClick={() => navigate(routePaths.subjects)}>Back to subjects</Button></Card>;
  return <div className="academic-page">
    <nav className="academic-breadcrumbs" aria-label="Breadcrumb"><Link to={routePaths.subjects}>Subjects</Link><span aria-hidden="true">/</span><span>{subject.name}</span></nav>
    <AcademicPageHeader title={subject.name} description={subject.description || 'Build modules and topics for this subject.'} action={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Icon name="plus" />Add module</Button>} />
    {feedback && <p className="academic-feedback" role="status">{feedback}</p>}
    {error && <div className="academic-inline-error" role="alert">{error}</div>}
    <Card className="subject-hero"><div className="subject-hero__heading"><div><p className="academic-eyebrow">Subject progress</p><strong>{formatProgress(subject.progress)}</strong><span>{subject.completedTopicCount} of {subject.topicCount} topics completed</span></div><Progress variant="circular" size="md" value={subject.progress} label="Subject progress" /></div><div className="academic-stat-grid"><div><strong>{subject.moduleCount}</strong><span>Modules</span></div><div><strong>{subject.topicCount}</strong><span>Topics</span></div><div><strong>{formatProgress(subject.progress)}</strong><span>Complete</span></div></div></Card>
    <section><div className="academic-section-heading"><div><p className="academic-eyebrow">Modules</p><h2>Course structure</h2></div><span>{modules.length} modules</span></div>{modules.length === 0 ? <Card className="academic-empty"><StateView state="empty" message="No modules added yet." /><Button onClick={() => setFormOpen(true)}><Icon name="plus" />Add module</Button></Card> : <div className="module-grid">{modules.map((module) => <ModuleCard key={module.id} module={module} onEdit={(item) => { setEditing(item); setFormOpen(true); }} onDelete={setDeleteTarget} />)}</div>}</section>
    <AcademicModal open={formOpen} title={editing ? 'Edit module' : 'Add module'} description={editing ? 'Update this module without affecting its topics.' : 'Add a module to this subject. Its order is assigned automatically.'} onClose={() => { if (!busy) { setFormOpen(false); setEditing(null); } }}><ModuleForm initial={editing ?? undefined} busy={busy} error={error} onCancel={() => { setFormOpen(false); setEditing(null); }} onSubmit={(input) => void submit(input)} /></AcademicModal>
    <ConfirmDialog open={Boolean(deleteTarget)} title="Delete module?" message="This will remove the module and its associated topics. The backend will ultimately control cascade behavior." busy={busy} onCancel={() => { if (!busy) setDeleteTarget(null); }} onConfirm={() => void remove()} />
  </div>;
}
