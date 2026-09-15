import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/icons/Icon';
import { HoverLift } from '@/components/motion';
import { routePaths } from '@/app/routes/routePaths';
import type { ModuleSummary } from '../types/academic';
import { formatProgress } from '../types/academic';

interface Props { module: ModuleSummary; onEdit: (module: ModuleSummary) => void; onDelete: (module: ModuleSummary) => void; }
export function ModuleCard({ module, onEdit, onDelete }: Props) {
  const navigate = useNavigate();
  return <HoverLift><Card variant="default" className="module-card">
    <button className="module-card__main" onClick={() => navigate(routePaths.moduleDetail(module.subjectId, module.id))} aria-label={`Open ${module.name}`}>
      <div className="module-card__heading"><div><p>Module {module.order}</p><h3>{module.name}</h3></div><Badge status={module.status === 'completed' ? 'completed' : module.status === 'in_progress' ? 'in-progress' : 'pending'}>{formatProgress(module.progress)}</Badge></div>
      {module.description && <p>{module.description}</p>}
      <Progress value={module.progress} label={`${module.completedTopicCount} of ${module.topicCount} topics completed`} size="sm" />
    </button>
    <div className="module-card__actions"><Button variant="ghost" size="sm" onClick={() => onEdit(module)} aria-label={`Edit ${module.name}`}><Icon name="settings" /></Button><Button variant="ghost" size="sm" onClick={() => onDelete(module)} aria-label={`Delete ${module.name}`}><Icon name="trash" /></Button></div>
  </Card></HoverLift>;
}
