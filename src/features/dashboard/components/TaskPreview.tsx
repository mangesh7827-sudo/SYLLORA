import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StateView } from '@/components/ui/StateView';
import { routePaths } from '@/app/routes/routePaths';
import type { DashboardTaskItem } from '../types/dashboard';

const labels = { pending: 'Pending', due_soon: 'Due Soon', overdue: 'Overdue', completed: 'Completed' } as const;
const variants = { pending: 'pending', due_soon: 'due-soon', overdue: 'overdue', completed: 'completed' } as const;

export function TaskPreview({ items }: { items: DashboardTaskItem[] }) {
  return (
    <Card className="dashboard-panel">
      <div className="dashboard-panel__header"><div><p className="dashboard-eyebrow">Deadlines</p><h2>Upcoming tasks</h2></div><Link to={routePaths.assignments}>View all</Link></div>
      {items.length === 0 ? <StateView state="empty" message="No assignments yet. Your task list will appear here." /> : (
        <ul className="dashboard-list dashboard-list--tasks">
          {items.map((item) => <li key={item.id} className="dashboard-list__item"><span><strong>{item.title}</strong><small>{item.context}{item.dueDate ? ` · Due ${item.dueDate}` : ''}</small></span><Badge status={variants[item.status]}>{labels[item.status]}</Badge></li>)}
        </ul>
      )}
    </Card>
  );
}
