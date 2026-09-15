import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/icons/Icon';
import { routePaths } from '@/app/routes/routePaths';

const actions = [
  { label: 'Open Study Tracker', to: routePaths.study, icon: 'book' as const },
  { label: 'Open Subjects', to: routePaths.subjects, icon: 'academic' as const },
  { label: 'Open Attendance', to: routePaths.attendance, icon: 'check' as const },
  { label: 'Open Timetable', to: routePaths.timetable, icon: 'calendar' as const },
];

export function QuickActions() {
  return <Card className="dashboard-panel"><div className="dashboard-panel__header"><div><p className="dashboard-eyebrow">Shortcuts</p><h2>Quick actions</h2></div></div><div className="dashboard-actions">{actions.map((action) => <Link className="dashboard-action" key={action.to} to={action.to}><span><Icon name={action.icon} /></span><strong>{action.label}</strong><Icon name="chevron" size={16} /></Link>)}</div></Card>;
}
