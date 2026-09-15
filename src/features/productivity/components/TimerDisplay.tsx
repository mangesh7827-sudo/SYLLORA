import { formatDuration } from '../utils/time';
export function TimerDisplay({ seconds, status }: { seconds: number; status?: string }) {
  return <div className="study-timer-display" aria-label={`Study timer ${formatDuration(seconds)}`}>
    <span aria-hidden="true">{formatDuration(seconds)}</span>
    <span className="study-timer-display__status">{status === 'PAUSED' ? 'Paused' : status === 'RUNNING' ? 'Running' : 'Ready'}</span>
  </div>;
}
