import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { StateView } from '@/components/ui/StateView';
import type { DashboardProgressItem } from '../types/dashboard';

export function ProgressOverview({ items, overall }: { items: DashboardProgressItem[]; overall: number }) {
  return (
    <Card className="dashboard-panel">
      <div className="dashboard-panel__header"><div><p className="dashboard-eyebrow">Academics</p><h2>Progress overview</h2></div></div>
      {items.length === 0 ? <StateView state="empty" message="No subjects yet. Add your first subject to start tracking progress." /> : <div className="dashboard-progress"><div className="dashboard-progress__overall"><Progress value={overall} variant="circular" size="md" label="Overall academic progress" /><div><strong>Overall progress</strong><p>Subject and topic progress will become available as you build your academic structure.</p></div></div>{items.map((item) => <div key={item.id} className="dashboard-progress__row"><span>{item.name}</span><Progress value={item.progress} label={`${item.name} progress`} /></div>)}</div>}
    </Card>
  );
}
