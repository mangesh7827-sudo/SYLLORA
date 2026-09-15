import { Card } from '@/components/ui/Card';
import { StateView } from '@/components/ui/StateView';
import type { DashboardScheduleItem } from '../types/dashboard';

export function SchedulePreview({ items }: { items: DashboardScheduleItem[] }) {
  return (
    <Card className="dashboard-panel">
      <div className="dashboard-panel__header"><div><p className="dashboard-eyebrow">Today</p><h2>Schedule</h2></div></div>
      {items.length === 0 ? <StateView state="empty" message="No timetable entries for today." /> : (
        <ul className="dashboard-list">
          {items.map((item) => <li key={item.id} className="dashboard-list__item"><span className="dashboard-list__time">{item.time}</span><span><strong>{item.subjectName}</strong><small>{item.title}</small></span></li>)}
        </ul>
      )}
    </Card>
  );
}
