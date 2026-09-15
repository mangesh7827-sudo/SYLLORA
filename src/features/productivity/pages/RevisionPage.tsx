import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { AcademicPageHeader } from '@/features/academics/components/AcademicPageHeader';
import { AcademicModal } from '@/features/academics/components/AcademicModal';
import { ConfirmDialog } from '@/features/academics/components/ConfirmDialog';
import { RevisionForm } from '../components/RevisionForm';
import { RevisionList } from '../components/RevisionList';
import { revisionService } from '../services/revisionService';
import { useAcademicCatalog } from '../hooks/useAcademicCatalog';
import type { RevisionRecord } from '@/types';
import type { RevisionInput } from '../types/productivity';
import { getWeekStart, localDateKey } from '../utils/time';
import { Card } from '@/components/ui/Card';
import { StateView } from '@/components/ui/StateView';
import { Icon } from '@/components/icons/Icon';

export function RevisionPage() {
  const { userId, subjects, modules, topics } = useAcademicCatalog(); const [records, setRecords] = useState<RevisionRecord[]>([]); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null); const [filter, setFilter] = useState('all'); const [subjectFilter, setSubjectFilter] = useState(''); const [formOpen, setFormOpen] = useState(false); const [editing, setEditing] = useState<RevisionRecord | null>(null); const [deleteTarget, setDeleteTarget] = useState<RevisionRecord | null>(null);
  const load = useCallback(async () => { if (!userId) return; setLoading(true); try { setRecords(await revisionService.getRevisions(userId)); setError(null); } catch { setError('Unable to load revision history.'); } finally { setLoading(false); } }, [userId]); useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => { const now = new Date(); return records.filter((record) => { if (subjectFilter && record.subjectId !== subjectFilter) return false; if (filter === 'today') return localDateKey(new Date(record.revisedAt)) === localDateKey(now); if (filter === 'week') return new Date(record.revisedAt).getTime() >= getWeekStart(now).getTime(); return true; }); }, [filter, records, subjectFilter]);
  const submit = async (input: RevisionInput) => { setBusy(true); setError(null); try { if (editing) await revisionService.updateRevision(userId, editing.id, input); else await revisionService.createRevision(userId, input); setFormOpen(false); setEditing(null); await load(); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to save this revision.'); } finally { setBusy(false); } };
  const remove = async () => { if (!deleteTarget) return; setBusy(true); try { await revisionService.deleteRevision(userId, deleteTarget.id); setDeleteTarget(null); await load(); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to delete this revision.'); } finally { setBusy(false); } };
  return <div className="productivity-page"><AcademicPageHeader title="Revision" description="Record what you revised and keep a focused history connected to your academic hierarchy." action={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Icon name="plus" />Add revision</Button>} />
    <section className="productivity-filter-row"><Select label="History" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All revisions</option><option value="today">Today</option><option value="week">This week</option></Select><Select label="Subject" value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}><option value="">All subjects</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</Select></section>
    {error && <Card><div className="productivity-error"><StateView state="error" message={error} /><Button variant="outline" onClick={() => void load()}>Try again</Button></div></Card>}
    <RevisionList records={filtered} subjects={subjects} modules={modules} topics={topics} onChanged={() => void load()} onEdit={(record) => { setEditing(record); setFormOpen(true); }} loading={loading} />
    <AcademicModal open={formOpen} title={editing ? 'Edit revision' : 'Add revision'} description="Select a subject first; module and topic stay constrained to that subject." onClose={() => { if (!busy) setFormOpen(false); }}><RevisionForm initial={editing ?? undefined} busy={busy} error={error} onCancel={() => setFormOpen(false)} onSubmit={(input) => void submit(input)} /></AcademicModal>
    <ConfirmDialog open={Boolean(deleteTarget)} title="Delete revision?" message="This revision record will be permanently removed from your history." busy={busy} onCancel={() => { if (!busy) setDeleteTarget(null); }} onConfirm={() => void remove()} />
  </div>;
}
