import { useEffect, useMemo } from 'react';
import { Select } from '@/components/ui/Select';
import { useAcademicCatalog } from '../hooks/useAcademicCatalog';

interface Value { subjectId?: string; moduleId?: string; topicId?: string }
export function AcademicTargetPicker({ value, onChange, disabled = false }: { value: Value; onChange: (value: Value) => void; disabled?: boolean }) {
  const { subjects, modules, topics, loading, error } = useAcademicCatalog();
  const subjectModules = useMemo(() => modules.filter((module) => module.subjectId === value.subjectId), [modules, value.subjectId]);
  const moduleTopics = useMemo(() => topics.filter((topic) => topic.moduleId === value.moduleId), [topics, value.moduleId]);
  useEffect(() => { if (value.moduleId && !subjectModules.some((module) => module.id === value.moduleId)) onChange({ subjectId: value.subjectId }); }, [subjectModules, value.moduleId, value.subjectId, onChange]);
  useEffect(() => { if (value.topicId && !moduleTopics.some((topic) => topic.id === value.topicId)) onChange({ ...value, topicId: undefined }); }, [moduleTopics, value, onChange]);
  return <div className="productivity-target-picker"><Select label="Subject" value={value.subjectId ?? ''} onChange={(event) => onChange({ subjectId: event.target.value || undefined })} disabled={disabled || loading} required><option value="">Select subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</Select><Select label="Module (optional)" value={value.moduleId ?? ''} onChange={(event) => onChange({ ...value, moduleId: event.target.value || undefined, topicId: undefined })} disabled={disabled || loading || !value.subjectId}><option value="">No module</option>{subjectModules.map((module) => <option key={module.id} value={module.id}>Module {module.order} · {module.name}</option>)}</Select><Select label="Topic (optional)" value={value.topicId ?? ''} onChange={(event) => onChange({ ...value, topicId: event.target.value || undefined })} disabled={disabled || loading || !value.moduleId}><option value="">No topic</option>{moduleTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</Select>{error && <p className="productivity-inline-error" role="alert">{error}</p>}</div>;
}
