import type { HTMLAttributes } from 'react';
import { Icon, type IconName } from '@/components/icons/Icon';
type Status = 'completed' | 'pending' | 'in-progress' | 'present' | 'absent' | 'due-soon' | 'overdue' | 'checked' | 'not-checked' | 'at-risk';
const icons: Partial<Record<Status, IconName>> = { completed: 'check', present: 'check', 'at-risk': 'alert', overdue: 'alert' };
type Props = HTMLAttributes<HTMLSpanElement> & { status: Status; showIcon?: boolean };
export function Badge({ status, showIcon = true, className = '', children, ...props }: Props) {
  const label = children ?? status.replaceAll('-', ' ');
  return <span className={`ui-badge ui-badge--${status} ${className}`.trim()} {...props}>{showIcon && icons[status] && <Icon name={icons[status]!} size={14} />}{label}</span>;
}
