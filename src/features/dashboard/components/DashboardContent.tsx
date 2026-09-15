import { useCallback, useEffect, useState } from 'react';
import { StateView } from '@/components/ui/StateView';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types';
import type { DashboardData } from '../types/dashboard';
import { getDashboard } from '../services/dashboardService';
import { WelcomeSection } from './WelcomeSection';
import { SummaryCard } from './SummaryCard';
import { SchedulePreview } from './SchedulePreview';
import { TaskPreview } from './TaskPreview';
import { ProgressOverview } from './ProgressOverview';
import { QuickActions } from './QuickActions';

export function DashboardContent({ user }: { user: User }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setData(await getDashboard(user));
      setStatus('ready');
    } catch {
      setData(null);
      setStatus('error');
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  if (status === 'loading') return <StateView state="loading" message="Loading your dashboard…" />;
  if (status === 'error') return <div className="dashboard-error"><StateView state="error" message="Unable to load your dashboard." /><Button variant="outline" onClick={() => void load()}>Retry</Button></div>;
  if (!data) return null;

  const nickname = data.user.nickname?.trim() || data.user.displayName;
  const attendance = data.summary.attendancePercentage === null ? '—' : `${data.summary.attendancePercentage}%`;
  const study = data.summary.todayStudyMinutes >= 60 ? `${Math.floor(data.summary.todayStudyMinutes / 60)}h ${data.summary.todayStudyMinutes % 60}m` : `${data.summary.todayStudyMinutes}m`;

  return <div className="dashboard-page"><WelcomeSection nickname={nickname} /><section className="dashboard-summary-grid" aria-label="Key summary"><SummaryCard title="Academic progress" value={`${data.summary.academicProgress}%`} detail="Overall progress" progress={data.summary.academicProgress} icon="academic" /><SummaryCard title="Attendance" value={attendance} detail={attendance === '—' ? 'No records yet' : 'Current attendance'} icon="check" /><SummaryCard title="Study time" value={study} detail={`${data.summary.completedStudySessions} completed sessions`} icon="clock" /><SummaryCard title="Pending tasks" value={String(data.summary.pendingTasks)} detail={`${data.summary.upcomingDeadlines} due soon`} icon="clipboard" /><SummaryCard title="Experiments" value={`${data.summary.experimentCompletionPercentage}%`} detail="Practical completion" icon="flask" progress={data.summary.experimentCompletionPercentage} /><SummaryCard title="Habits" value={`${data.summary.habitsCompleted}/${data.summary.habitsTotal}`} detail="Completed today" icon="target" /></section><section className="dashboard-grid dashboard-grid--primary"><SchedulePreview items={data.schedule} /><TaskPreview items={data.tasks} /></section><section className="dashboard-grid dashboard-grid--secondary"><ProgressOverview items={data.progress} overall={data.summary.academicProgress} /><QuickActions /></section></div>;
}
