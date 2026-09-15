import { useEffect, useMemo, useState } from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { useAcademicCatalog } from '../hooks/useAcademicCatalog';
import type { StudySessionInput, StudyTargetType } from '../types/productivity';

interface Props {
  value: Partial<StudySessionInput>;
  onChange: (value: Partial<StudySessionInput>) => void;
  allowExtraTask?: boolean;
  disabled?: boolean;
}

export function StudyTargetPicker({ value, onChange, allowExtraTask = true, disabled = false }: Props) {
  const { subjects, modules, topics, loading, error } = useAcademicCatalog();
  const targetType: StudyTargetType = value.targetType ?? 'SUBJECT';
  const subjectModules = useMemo(() => modules.filter((module) => module.subjectId === value.subjectId), [modules, value.subjectId]);
  const moduleTopics = useMemo(() => topics.filter((topic) => topic.moduleId === value.moduleId), [topics, value.moduleId]);
  const [localExtraTask, setLocalExtraTask] = useState(value.extraTaskLabel ?? '');

  useEffect(() => setLocalExtraTask(value.extraTaskLabel ?? ''), [value.extraTaskLabel]);

  const changeType = (next: StudyTargetType) => onChange({ targetType: next, subjectId: undefined, moduleId: undefined, topicId: undefined, extraTaskLabel: undefined });
  const changeSubject = (subjectId: string) => onChange({ ...value, subjectId: subjectId || undefined, moduleId: undefined, topicId: undefined });
  const changeModule = (moduleId: string) => onChange({ ...value, moduleId: moduleId || undefined, topicId: undefined });

  return <div className="productivity-target-picker">
    {allowExtraTask && <Select label="Study target type" value={targetType} onChange={(event) => changeType(event.target.value as StudyTargetType)} disabled={disabled || loading}>
      <option value="SUBJECT">Subject</option><option value="MODULE">Module</option><option value="TOPIC">Topic</option><option value="EXTRA_TASK">Extra learning</option>
    </Select>}
    {!allowExtraTask && <p className="productivity-form-label">Revision target</p>}
    {targetType === 'EXTRA_TASK' ? <Input label="Extra learning task" value={localExtraTask} onChange={(event) => { setLocalExtraTask(event.target.value); onChange({ ...value, targetType, extraTaskLabel: event.target.value }); }} placeholder="e.g. C++ practice" disabled={disabled} required /> : <>
      <Select label="Subject" value={value.subjectId ?? ''} onChange={(event) => changeSubject(event.target.value)} disabled={disabled || loading} required>
        <option value="">Select subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
      </Select>
      {(targetType === 'MODULE' || targetType === 'TOPIC') && <Select label="Module" value={value.moduleId ?? ''} onChange={(event) => changeModule(event.target.value)} disabled={disabled || loading || !value.subjectId} required>
        <option value="">Select module</option>{subjectModules.map((module) => <option key={module.id} value={module.id}>Module {module.order} · {module.name}</option>)}
      </Select>}
      {targetType === 'TOPIC' && <Select label="Topic" value={value.topicId ?? ''} onChange={(event) => onChange({ ...value, topicId: event.target.value || undefined })} disabled={disabled || loading || !value.moduleId} required>
        <option value="">Select topic</option>{moduleTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
      </Select>}
    </>}
    {error && <p className="productivity-inline-error" role="alert">{error}</p>}
  </div>;
}
