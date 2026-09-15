import { HoverLift } from '@/components/motion';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Icon, type IconName } from '@/components/icons/Icon';

interface SummaryCardProps {
  title: string;
  value: string;
  detail: string;
  icon: IconName;
  progress?: number;
}

export function SummaryCard({ title, value, detail, icon, progress }: SummaryCardProps) {
  return (
    <HoverLift>
      <Card variant="interactive" className="dashboard-summary-card">
        <div className="dashboard-summary-card__top">
          <span className="dashboard-summary-card__icon" aria-hidden="true"><Icon name={icon} /></span>
          <span className="dashboard-summary-card__label">{title}</span>
        </div>
        <strong>{value}</strong>
        <p>{detail}</p>
        {progress !== undefined && <Progress value={progress} showValue={false} size="sm" label={`${title} progress`} />}
      </Card>
    </HoverLift>
  );
}
