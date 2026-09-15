import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import type { Module, Subject, Topic } from '@/types';
import type { ModuleInput, SubjectInput, TopicInput } from '../types/academic';

type FormProps = { busy: boolean; error: string | null; onCancel: () => void; };

export function SubjectForm({ initial, busy, error, onCancel, onSubmit }: FormProps & { initial?: Partial<Subject>; onSubmit: (input: SubjectInput) => void }) {
  const [name, setName] = useState(initial?.name ?? ''); const [code, setCode] = useState(initial?.code ?? ''); const [description, setDescription] = useState(initial?.description ?? '');
  return <form className="academic-form" onSubmit={(e) => { e.preventDefault(); onSubmit({ name, code, description }); }}><Input label="Subject name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="off" /><Input label="Subject code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" /><Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />{error && <p className="academic-form__error" role="alert">{error}</p>}<div className="academic-form__actions"><Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : initial?.id ? 'Save changes' : 'Create subject'}</Button></div></form>;
}

export function ModuleForm({ initial, busy, error, onCancel, onSubmit }: FormProps & { initial?: Partial<Module>; onSubmit: (input: ModuleInput) => void }) {
  const [name, setName] = useState(initial?.name ?? ''); const [description, setDescription] = useState(initial?.description ?? ''); const [order, setOrder] = useState(String(initial?.order ?? ''));
  return <form className="academic-form" onSubmit={(e) => { e.preventDefault(); const parsed = Number(order); onSubmit({ name, description, order: Number.isFinite(parsed) && parsed > 0 ? parsed : undefined }); }}><Input label="Module name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="off" /><Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />{initial?.id && <Input label="Order" type="number" min="1" value={order} onChange={(e) => setOrder(e.target.value)} />}{error && <p className="academic-form__error" role="alert">{error}</p>}<div className="academic-form__actions"><Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : initial?.id ? 'Save changes' : 'Create module'}</Button></div></form>;
}

export function TopicForm({ initial, busy, error, onCancel, onSubmit }: FormProps & { initial?: Partial<Topic>; onSubmit: (input: TopicInput) => void }) {
  const [name, setName] = useState(initial?.name ?? ''); const [description, setDescription] = useState(initial?.description ?? ''); const [completed, setCompleted] = useState(initial?.status === 'completed');
  return <form className="academic-form" onSubmit={(e) => { e.preventDefault(); onSubmit({ name, description, status: completed ? 'completed' : 'pending' }); }}><Input label="Topic name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="off" /><Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} /><Checkbox label="Mark as completed" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />{error && <p className="academic-form__error" role="alert">{error}</p>}<div className="academic-form__actions"><Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : initial?.id ? 'Save changes' : 'Create topic'}</Button></div></form>;
}
