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
import type { ModuleSummary, TopicInput } from '../types/academic';
import type { Topic } from '@/types';
import { formatProgress } from '../types/academic';
import { AcademicPageHeader } from '../components/AcademicPageHeader';
import { TopicItem } from '../components/TopicItem';
import { AcademicModal } from '../components/AcademicModal';
import { TopicForm } from '../components/AcademicForm';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function ModuleDetailPage() {
  const { subjectId, moduleId } = useParams(); const navigate = useNavigate(); const { currentUser } = useAuth(); const userId = currentUser?.id ?? '';
  const [module, setModule] = useState<ModuleSummary | null>(null); const [topics, setTopics] = useState<Topic[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [formOpen, setFormOpen] = useState(false); const [editing, setEditing] = useState<Topic | null>(null); const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null); const [busy, setBusy] = useState(false); const [feedback, setFeedback] = useState<string | null>(null);
  const load = useCallback(async () => { if (!userId || !moduleId || !subjectId) return; setLoading(true); setError(null); try { const nextModule = await academicService.getModule(userId, moduleId); if (!nextModule || nextModule.subjectId !== subjectId) { setModule(null); setError('Module not found.'); return; } const nextTopics = await academicService.getTopics(userId, moduleId); setModule(nextModule); setTopics(nextTopics); } catch { setError('We could not load this module.'); } finally { setLoading(false); } }, [moduleId, subjectId, userId]);
  useEffect(() => { void load(); }, [load]);
  const submit = async (input: TopicInput) => { setBusy(true); try { if (editing) await academicService.updateTopic(userId, editing.id, input); else await academicService.createTopic(userId, moduleId!, input); setFormOpen(false); setEditing(null); setFeedback(editing ? 'Topic updated.' : 'Topic created.'); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'We could not save the topic.'); } finally { setBusy(false); } };
  const remove = async () => { if (!deleteTarget) return; setBusy(true); try { await academicService.deleteTopic(userId, deleteTarget.id); setDeleteTarget(null); setFeedback('Topic deleted.'); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'We could not delete the topic.'); } finally { setBusy(false); } };
  const toggle = async (topic: Topic) => { setBusy(true); try { await academicService.setTopicStatus(userId, topic.id, topic.status === 'completed' ? 'pending' : 'completed'); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'We could not update topic status.'); } finally { setBusy(false); } };
  if (loading) return <Card><StateView state="loading" message="Loading module…" /></Card>;
  if (!module) return <Card className="academic-error"><StateView state="error" message={error ?? 'Module not found.'} /><Button variant="outline" onClick={() => navigate(subjectId ? routePaths.subjectDetail(subjectId) : routePaths.subjects)}>Back</Button></Card>;
  return <div className="academic-page">
    <nav className="academic-breadcrumbs" aria-label="Breadcrumb"><Link to={routePaths.subjects}>Subjects</Link><span>/</span><Link to={routePaths.subjectDetail(module.subjectId)}>Subject</Link><span>/</span><span>{module.name}</span></nav>
    <AcademicPageHeader eyebrow={`Module ${module.order}`} title={module.name} description={module.description || 'Track the topics inside this module.'} action={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Icon name="plus" />Add topic</Button>} />
    {feedback && <p className="academic-feedback" role="status">{feedback}</p>}{error && <div className="academic-inline-error" role="alert">{error}</div>}
    <Card className="module-hero"><div><p className="academic-eyebrow">Module progress</p><strong>{formatProgress(module.progress)}</strong><span>{module.completedTopicCount} of {module.topicCount} topics completed</span></div><Progress value={module.progress} label="Module progress" /></Card>
    <section><div className="academic-section-heading"><div><p className="academic-eyebrow">Topics</p><h2>Topic checklist</h2></div><span>{module.topicCount} topics</span></div>{topics.length === 0 ? <Card className="academic-empty"><StateView state="empty" message="No topics added yet." /><Button onClick={() => setFormOpen(true)}><Icon name="plus" />Add topic</Button></Card> : <Card className="topic-list-card"><ul className="topic-list">{topics.map((topic) => <TopicItem key={topic.id} topic={topic} onToggle={(item) => void toggle(item)} onEdit={(item) => { setEditing(item); setFormOpen(true); }} onDelete={setDeleteTarget} />)}</ul></Card>}</section>
    <AcademicModal open={formOpen} title={editing ? 'Edit topic' : 'Add topic'} description={editing ? 'Changing the topic text will not reset its completion state.' : 'Add a topic to this module.'} onClose={() => { if (!busy) { setFormOpen(false); setEditing(null); } }}><TopicForm initial={editing ?? undefined} busy={busy} error={error} onCancel={() => { setFormOpen(false); setEditing(null); }} onSubmit={(input) => void submit(input)} /></AcademicModal>
    <ConfirmDialog open={Boolean(deleteTarget)} title="Delete topic?" message="This will remove the topic and recalculate module and subject progress." busy={busy} onCancel={() => { if (!busy) setDeleteTarget(null); }} onConfirm={() => void remove()} />
  </div>;
}
