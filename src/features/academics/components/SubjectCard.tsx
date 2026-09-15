import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/icons/Icon';
import { HoverLift } from '@/components/motion';
import { routePaths } from '@/app/routes/routePaths';
import type { SubjectSummary } from '../types/academic';
import { formatProgress } from '../types/academic';

interface Props { subject: SubjectSummary; onEdit: (subject: SubjectSummary) => void; onDelete: (subject: SubjectSummary) => void; }
export function SubjectCard({ subject, onEdit, onDelete }: Props) {
  const navigate = useNavigate();
  return <HoverLift><Card variant="default" className="academic-card">
    <button className="academic-card__main" onClick={() => navigate(routePaths.subjectDetail(subject.id))} aria-label={`Open ${subject.name}`}>
      <div className="academic-card__heading"><span className="academic-card__accent" aria-hidden="true" /><div><h2>{subject.name}</h2>{subject.code && <span>{subject.code}</span>}</div></div>
      {subject.description && <p className="academic-card__description">{subject.description}</p>}
      <div className="academic-card__meta"><Badge status={subject.progress === 100 ? 'completed' : 'pending'}>{formatProgress(subject.progress)}</Badge><span>{subject.moduleCount} modules</span><span>{subject.topicCount} topics</span></div>
      <Progress value={subject.progress} label="Progress" size="sm" />
    </button>
    <div className="academic-card__actions"><Button variant="ghost" size="sm" onClick={() => onEdit(subject)}><Icon name="settings" />Edit</Button><Button variant="ghost" size="sm" onClick={() => onDelete(subject)} aria-label={`Delete ${subject.name}`}><Icon name="trash" />Delete</Button></div>
  </Card></HoverLift>;
}
