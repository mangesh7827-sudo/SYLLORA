import { Card } from '@/components/ui/Card';
import { HoverLift } from '@/components/motion';
import type { StudySummary } from '../types/productivity';
import { formatDurationShort } from '../utils/time';

export function StudySummaryCards({ summary }: { summary: StudySummary }) {
  const items = [
    ['Today', formatDurationShort(summary.todaySeconds), 'Local calendar day'],
    ['This week', formatDurationShort(summary.weekSeconds), 'Monday–Sunday'],
    ['Total time', formatDurationShort(summary.totalSeconds), 'Completed sessions'],
    ['Sessions', String(summary.completedSessions), `${formatDurationShort(summary.averageSessionSeconds)} average`],
  ];
  return <section className="productivity-summary-grid" aria-label="Study time summary">{items.map(([title, value, detail]) => <HoverLift key={title}><Card variant="interactive" className="productivity-summary-card"><span>{title}</span><strong>{value}</strong><small>{detail}</small></Card></HoverLift>)}</section>;
}
