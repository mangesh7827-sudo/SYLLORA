import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import type { StudySession } from '@/types';
import { studyService } from '../services/studyService';
import type { ActiveTimerState, StudySessionInput } from '../types/productivity';
import { getElapsedSeconds } from '../utils/time';

export function useStudyTimer() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id ?? '';
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) { setActiveSession(null); setActiveTimer(null); setElapsedSeconds(0); setLoading(false); return; }
    try {
      const [session, timer] = await Promise.all([studyService.getActiveSession(userId), studyService.getActiveTimer(userId)]);
      setActiveSession(session);
      setActiveTimer(timer);
      setElapsedSeconds(timer ? getElapsedSeconds(timer.accumulatedSeconds, timer.lastStartedAt) : 0);
      setError(null);
    } catch { setError('Unable to load the active study timer.'); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!activeTimer) return;
    const tick = () => setElapsedSeconds(getElapsedSeconds(activeTimer.accumulatedSeconds, activeTimer.lastStartedAt));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [activeTimer]);

  const run = useCallback(async (operation: () => Promise<StudySession>) => { setBusy(true); setError(null); try { const session = await operation(); await refresh(); return session; } catch (caught) { const message = caught instanceof Error ? caught.message : 'The study timer could not be updated.'; setError(message); throw caught; } finally { setBusy(false); } }, [refresh]);
  const start = useCallback((input: StudySessionInput) => run(() => studyService.startSession(userId, input)), [run, userId]);
  const pause = useCallback(() => activeSession ? run(() => studyService.pauseSession(userId, activeSession.id)) : Promise.reject(new Error('No active study session.')), [activeSession, run, userId]);
  const resume = useCallback(() => activeSession ? run(() => studyService.resumeSession(userId, activeSession.id)) : Promise.reject(new Error('No active study session.')), [activeSession, run, userId]);
  const complete = useCallback((input?: Partial<StudySessionInput>) => activeSession ? run(() => studyService.completeSession(userId, activeSession.id, input)) : Promise.reject(new Error('No active study session.')), [activeSession, run, userId]);
  const cancel = useCallback(() => activeSession ? run(() => studyService.cancelSession(userId, activeSession.id)) : Promise.reject(new Error('No active study session.')), [activeSession, run, userId]);

  return { activeSession, activeTimer, elapsedSeconds, loading, busy, error, refresh, start, pause, resume, complete, cancel };
}
