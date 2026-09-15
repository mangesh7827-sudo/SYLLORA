import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AcademicPageHeader } from '@/features/academics/components/AcademicPageHeader';
import { AcademicModal } from '@/features/academics/components/AcademicModal';
import { ConfirmDialog } from '@/features/academics/components/ConfirmDialog';
import { useAcademicCatalog } from '@/features/productivity/hooks/useAcademicCatalog';
import { projectsService } from '../services/api';
import type { Project } from '@/types';

export function ProjectsPage() {
  const { userId, subjects } = useAcademicCatalog();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true); setError(null);
    try { setItems(await projectsService.list()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load projects.'); }
    finally { setLoading(false); }
  }, [userId]);
  useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => items.filter(x => filter === 'ALL' || x.status === filter), [items, filter]);
  const subjectName = (id?: string) => subjects.find(x => x.id === id)?.name ?? 'No subject';
  const save = async (input: { subjectId?: string; name: string; dueDate?: string; status: Project['status'] }) => {
    setBusy(true); setError(null);
    try {
      const body = { ...input, subjectId: input.subjectId || undefined, dueDate: input.dueDate || undefined };
      if (editing) await projectsService.update(editing.id, body);
      else await projectsService.create(body as Omit<Project, 'id' | 'userId'>);
      setOpen(false); setEditing(null); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save project.'); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    if (!deleteTarget) return; setBusy(true);
    try { await projectsService.remove(deleteTarget.id); setDeleteTarget(null); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to delete project.'); }
    finally { setBusy(false); }
  };
  return <div className="phase10-page">
    <AcademicPageHeader eyebrow="Academics" title="Projects" description="Track academic projects, deadlines and completion." action={<Button onClick={() => { setEditing(null); setOpen(true); }}>Add project</Button>} />
    {error && <Card><p className="phase10-error" role="alert">{error}</p></Card>}
    <Card className="phase10-filters"><Select label="Status" value={filter} onChange={e => setFilter(e.target.value)}><option value="ALL">All</option><option value="pending">Pending</option><option value="completed">Completed</option></Select></Card>
    {loading ? <Card><p>Loading projects…</p></Card> : filtered.length === 0 ? <Card><p>No projects yet.</p><Button onClick={() => setOpen(true)}>Add project</Button></Card> : <div className="phase10-report-grid">{filtered.map(p => <Card key={p.id}><h3>{p.name}</h3><p>{subjectName(p.subjectId)}</p><p>{p.dueDate ? `Due ${p.dueDate}` : 'No due date'}</p><strong>{p.status === 'completed' ? 'Completed' : 'Pending'}</strong><div className="phase8-inline-actions"><Button size="sm" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}>Edit</Button><Button size="sm" variant="ghost" onClick={() => setDeleteTarget(p)}>Delete</Button></div></Card>)}</div>}
    <ProjectForm open={open} initial={editing} subjects={subjects} busy={busy} error={error} onClose={() => { if (!busy) setOpen(false); }} onSubmit={save} />
    <ConfirmDialog open={Boolean(deleteTarget)} title="Delete project?" message="This project will be permanently removed." busy={busy} onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove()} />
  </div>;
}
function ProjectForm({ open, initial, subjects, busy, error, onClose, onSubmit }: { open: boolean; initial: Project | null; subjects: Array<{ id: string; name: string }>; busy: boolean; error: string | null; onClose: () => void; onSubmit: (input: { subjectId?: string; name: string; dueDate?: string; status: Project['status'] }) => void }) {
  const [v, setV] = useState({ subjectId: initial?.subjectId ?? '', name: initial?.name ?? '', dueDate: initial?.dueDate ?? '', status: initial?.status ?? 'pending' as Project['status'] });
  useEffect(() => setV({ subjectId: initial?.subjectId ?? '', name: initial?.name ?? '', dueDate: initial?.dueDate ?? '', status: initial?.status ?? 'pending' }), [initial, open]);
  return <AcademicModal open={open} title={initial ? 'Edit project' : 'Add project'} description="Keep project deadlines and completion status current." onClose={onClose}><form className="academic-form" onSubmit={e => { e.preventDefault(); onSubmit(v); }}><Select label="Subject" value={v.subjectId} onChange={e => setV({ ...v, subjectId: e.target.value })}><option value="">No subject</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</Select><Input label="Project name" value={v.name} onChange={e => setV({ ...v, name: e.target.value })} required/><Input label="Due date" type="date" value={v.dueDate} onChange={e => setV({ ...v, dueDate: e.target.value })}/><Select label="Status" value={v.status} onChange={e => setV({ ...v, status: e.target.value as Project['status'] })}><option value="pending">Pending</option><option value="completed">Completed</option></Select>{error && <p className="phase10-error" role="alert">{error}</p>}<div className="academic-form__actions"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save project'}</Button></div></form></AcademicModal>;
}
