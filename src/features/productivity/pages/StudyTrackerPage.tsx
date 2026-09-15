import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { AcademicPageHeader } from '@/features/academics/components/AcademicPageHeader';
import { StudyTimerPanel } from '../components/StudyTimerPanel';
import { StudySummaryCards } from '../components/StudySummaryCards';
import { StudySessionList } from '../components/StudySessionList';
import { StudyDistribution } from '../components/StudyDistribution';
import { studyService } from '../services/studyService';
import { useAcademicCatalog } from '../hooks/useAcademicCatalog';
import type { StudySession } from '@/types';
import type { StudySummary, SubjectStudyTime } from '../types/productivity';
import { getWeekStart, localDateKey } from '../utils/time';
import { Card } from '@/components/ui/Card';
import { StateView } from '@/components/ui/StateView';

export function StudyTrackerPage() {
  const { userId, subjects, modules, topics } = useAcademicCatalog();
  const [sessions, setSessions] = useState<StudySession[]>([]); const [summary, setSummary] = useState<StudySummary>({ todaySeconds: 0, weekSeconds: 0, totalSeconds: 0, completedSessions: 0, averageSessionSeconds: 0 }); const [bySubject, setBySubject] = useState<SubjectStudyTime[]>([]); const [loading, setLoading] = useState(true); const [filter, setFilter] = useState('all'); const [subjectFilter, setSubjectFilter] = useState(''); const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { if (!userId) return; setLoading(true); setError(null); try { const [nextSessions, nextSummary, nextDistribution] = await Promise.all([studyService.getSessions(userId), studyService.getSummary(userId), studyService.getStudyTimeBySubject(userId)]); setSessions(nextSessions); setSummary(nextSummary); setBySubject(nextDistribution); } catch { setError('Unable to load study history.'); } finally { setLoading(false); } }, [userId]);
  useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => { const now = new Date(); return sessions.filter((session) => { if (subjectFilter && session.subjectId !== subjectFilter) return false; if (filter === 'today') return localDateKey(new Date(session.startedAt)) === localDateKey(now); if (filter === 'week') return new Date(session.startedAt).getTime() >= getWeekStart(now).getTime(); return true; }); }, [filter, sessions, subjectFilter]);
  return <div className="productivity-page"><AcademicPageHeader title="Study Tracker" description="Track your study time, focus areas, and recent learning sessions." action={<Button variant="outline" onClick={() => void load()} disabled={loading}>Refresh</Button>} />
    <StudyTimerPanel onSaved={() => void load()} />
    <StudySummaryCards summary={summary} />
    <section className="productivity-filter-row"><Select label="History" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All sessions</option><option value="today">Today</option><option value="week">This week</option></Select><Select label="Subject" value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}><option value="">All subjects</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</Select></section>
    {error && <Card><div className="productivity-error"><StateView state="error" message={error} /><Button variant="outline" onClick={() => void load()}>Try again</Button></div></Card>}
    <StudySessionList sessions={filtered} subjects={subjects} modules={modules} topics={topics} onChanged={() => void load()} loading={loading} />
    <StudyDistribution items={bySubject} subjects={subjects} />
  </div>;
}
