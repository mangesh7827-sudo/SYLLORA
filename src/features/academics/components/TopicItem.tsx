import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/icons/Icon';
import type { Topic } from '@/types';

interface Props { topic: Topic; onToggle: (topic: Topic) => void; onEdit: (topic: Topic) => void; onDelete: (topic: Topic) => void; }
export function TopicItem({ topic, onToggle, onEdit, onDelete }: Props) {
  const completed = topic.status === 'completed';
  return <li className={`topic-item${completed ? ' topic-item--completed' : ''}`}>
    <Checkbox checked={completed} onChange={() => onToggle(topic)} label="" aria-label={`${completed ? 'Mark pending' : 'Mark completed'}: ${topic.name}`} />
    <div className="topic-item__content"><strong>{topic.name}</strong>{topic.description && <p>{topic.description}</p>}</div>
    <Badge status={completed ? 'completed' : 'pending'}>{completed ? 'Completed' : 'Pending'}</Badge>
    <div className="topic-item__actions"><Button variant="ghost" size="sm" onClick={() => onEdit(topic)} aria-label={`Edit ${topic.name}`}><Icon name="settings" /></Button><Button variant="ghost" size="sm" onClick={() => onDelete(topic)} aria-label={`Delete ${topic.name}`}><Icon name="trash" /></Button></div>
  </li>;
}
