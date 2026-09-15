import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import type { SubjectSummary } from '@/features/academics/types/academic';
import type { SubjectStudyTime } from '../types/productivity';
import { formatDurationShort } from '../utils/time';

export function StudyDistribution({ items, subjects }: { items: SubjectStudyTime[]; subjects: SubjectSummary[] }) {
  const max = Math.max(0, ...items.map((item) => item.seconds));
  return <Card><div className="productivity-list-header"><div><p className="academic-eyebrow">Distribution</p><h2>Study time by subject</h2></div></div>{items.length === 0 ? <p className="productivity-muted">Study time by subject will appear after your first completed session.</p> : <div className="study-distribution">{items.slice(0, 8).map((item) => <div className="study-distribution__row" key={item.subjectId}><div><strong>{subjects.find((subject) => subject.id === item.subjectId)?.name ?? 'Subject'}</strong><span>{formatDurationShort(item.seconds)}</span></div><Progress value={max ? (item.seconds / max) * 100 : 0} showValue={false} size="sm" label="Study time share" /></div>)}</div>}</Card>;
}
