import type { StudySession } from '@/types';

export function getElapsedSeconds(accumulatedSeconds: number, lastStartedAt: string | null, nowMs = Date.now()): number {
  if (!lastStartedAt) return Math.max(0, Math.floor(accumulatedSeconds));
  const startedMs = Date.parse(lastStartedAt);
  if (!Number.isFinite(startedMs)) return Math.max(0, Math.floor(accumulatedSeconds));
  return Math.max(0, Math.floor(accumulatedSeconds + (nowMs - startedMs) / 1000));
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function formatDurationShort(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatDurationDetailed(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${remainder}s`;
  return `${remainder}s`;
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getWeekStart(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function isSessionOnLocalDay(session: StudySession, date: Date): boolean {
  return session.status === 'COMPLETED' && localDateKey(new Date(session.startedAt)) === localDateKey(date);
}

export function isSessionInCurrentWeek(session: StudySession, date: Date): boolean {
  if (session.status !== 'COMPLETED') return false;
  const started = new Date(session.startedAt).getTime();
  return started >= getWeekStart(date).getTime() && started <= date.getTime();
}
