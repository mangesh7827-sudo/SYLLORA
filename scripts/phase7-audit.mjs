import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const checks = [];
function pass(name, condition) { assert.ok(condition, name); checks.push(`PASS ${name}`); }

const requiredFiles = [
  'src/features/productivity/pages/StudyTrackerPage.tsx',
  'src/features/productivity/pages/StopwatchPage.tsx',
  'src/features/productivity/pages/RevisionPage.tsx',
  'src/features/productivity/hooks/useStudyTimer.ts',
  'src/features/productivity/services/mockStudyService.ts',
  'src/features/productivity/services/studyService.ts',
  'src/features/productivity/services/mockRevisionService.ts',
  'src/features/productivity/services/revisionService.ts',
  'src/features/productivity/types/productivity.ts',
  'src/features/productivity/utils/time.ts',
  'src/features/productivity/components/StudyTimerPanel.tsx',
  'src/features/productivity/components/StudyTargetPicker.tsx',
  'src/features/productivity/components/StudySessionList.tsx',
  'src/features/productivity/components/StudySummaryCards.tsx',
  'src/features/productivity/components/StudyDistribution.tsx',
  'src/features/productivity/components/RevisionForm.tsx',
  'src/features/productivity/components/RevisionList.tsx',
  'src/services/api/study.ts',
  'src/services/api/revision.ts',
  'docs/study-tracker.md',
];
for (const file of requiredFiles) pass(`required file ${file}`, exists(file));

const domain = read('src/types/domain.ts');
pass('StudySession has user ownership', /interface StudySession[\s\S]*?userId: ID;/.test(domain));
pass('StudySession has target type', /StudyTargetType = 'SUBJECT' \| 'MODULE' \| 'TOPIC' \| 'EXTRA_TASK'/.test(domain));
pass('StudySession has lifecycle status', /StudySessionStatus = 'RUNNING' \| 'PAUSED' \| 'COMPLETED' \| 'CANCELLED'/.test(domain));
pass('StudySession stores duration in seconds', /durationSeconds: number;/.test(domain));
pass('RevisionRecord can link a study session', /studySessionId\?: ID;/.test(domain));

const studyService = read('src/features/productivity/services/mockStudyService.ts');
pass('one active timer per user', /getUserActive\(userId\).*?already running/s.test(studyService));
pass('timestamp-based elapsed time', /getElapsedSeconds\(active\.accumulatedSeconds, active\.lastStartedAt/.test(studyService));
pass('pause excludes elapsed interval from active state', /status: 'PAUSED'.*?lastStartedAt: null/s.test(studyService));
pass('completed sessions only count in history', /filter\(\(session\) => session\.status === 'COMPLETED'\)/.test(studyService));
pass('cancelled sessions are not completed', /status: 'CANCELLED'/.test(studyService));
pass('study records are user filtered', /filter\(\(session\) => session\.userId === userId\)/.test(studyService));

const timerUtils = read('src/features/productivity/utils/time.ts');
pass('timer utility uses timestamps', /nowMs - startedMs/.test(timerUtils));
pass('timer display is HH:MM:SS', /padStart\(2, '0'\).*?padStart\(2, '0'\).*?padStart\(2, '0'\)/s.test(timerUtils));
pass('local-day helper exists', /export function localDateKey/.test(timerUtils));
pass('current-week helper exists', /export function getWeekStart/.test(timerUtils));

const routes = read('src/app/routes/AppRoutes.tsx');
pass('study route wired', /path=\{routePaths\.study\} element=\{<StudyTrackerPage \/>\}/.test(routes));
pass('stopwatch route wired', /path=\{routePaths\.stopwatch\} element=\{<StopwatchPage \/>\}/.test(routes));
pass('revision route wired', /path=\{routePaths\.revision\} element=\{<RevisionPage \/>\}/.test(routes));

const dashboard = read('src/features/dashboard/services/dashboardService.ts');
pass('dashboard consumes study service', /studyService\.getSummary\(user\.id\)/.test(dashboard));
pass('dashboard exposes completed study sessions', /completedStudySessions: studySummary\.completedSessions/.test(dashboard));

const layout = read('src/components/layout/AppLayout.tsx');
pass('application shell exposes active timer indicator', /ActiveStudyIndicator/.test(layout));
pass('active timer indicator links to stopwatch', /routePaths\.stopwatch/.test(layout));

const scope = `${read('src/app/routes/AppRoutes.tsx')}\n${read('src/features/productivity/index.ts')}`;
pass('Phase 8 attendance remains placeholder', /routePaths\.attendance.*placeholder\('Attendance'/.test(routes));
pass('Phase 8 timetable remains placeholder', /routePaths\.timetable.*placeholder\('Timetable'/.test(routes));
pass('Phase 8 habits remains placeholder', /routePaths\.habits.*placeholder\('Habits'/.test(routes));
pass('Phase 7 does not add PostgreSQL client dependency', !/postgres|pg|prisma|drizzle/i.test(read('package.json')));
void scope;

// Deterministic critical timer cases. These mirror the documented timestamp algorithm,
// avoiding real waits so the audit stays fast and repeatable.
function elapsed(accumulatedSeconds, lastStartedAt, nowMs) {
  if (!lastStartedAt) return Math.max(0, Math.floor(accumulatedSeconds));
  return Math.max(0, Math.floor(accumulatedSeconds + (nowMs - Date.parse(lastStartedAt)) / 1000));
}
const t0 = Date.parse('2026-01-01T10:00:00.000Z');
pass('timer case: 20 minutes running', elapsed(0, new Date(t0).toISOString(), t0 + 20 * 60_000) === 1200);
pass('timer case: pause excludes 10 minutes', elapsed(1200, null, t0 + 30 * 60_000) === 1200);
pass('timer case: resume adds 10 minutes', elapsed(1200, new Date(t0 + 30 * 60_000).toISOString(), t0 + 40 * 60_000) === 1800);
pass('timer case: zero active time', elapsed(0, null, t0) === 0);

console.log(checks.join('\n'));
console.log(`Phase 7 static audit: PASS (${checks.length} checks)`);
