import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const required = [
  'src/pages/DashboardPage.tsx',
  'src/components/layout/AppLayout.tsx',
  'src/features/dashboard/components/DashboardContent.tsx',
  'src/features/dashboard/services/dashboardService.ts',
  'src/features/dashboard/types/dashboard.ts',
];
const checks = [
  ['dashboard route', 'src/app/routes/AppRoutes.tsx', 'DashboardPage'],
  ['protected shell', 'src/app/routes/AppRoutes.tsx', '<Route element={<ProtectedRoute />}>'],
  ['auth user usage', 'src/pages/DashboardPage.tsx', 'currentUser'],
  ['desktop navigation', 'src/components/layout/AppLayout.tsx', 'app-shell__sidebar'],
  ['mobile navigation', 'src/components/layout/AppLayout.tsx', 'app-shell__mobile-drawer'],
  ['route current state', 'src/components/layout/AppLayout.tsx', 'aria-label'],
  ['dashboard service boundary', 'src/features/dashboard/types/dashboard.ts', 'DashboardDataSource'],
  ['empty schedule state', 'src/features/dashboard/components/SchedulePreview.tsx', 'No timetable entries'],
  ['empty task state', 'src/features/dashboard/components/TaskPreview.tsx', 'No assignments yet'],
  ['quick actions', 'src/features/dashboard/components/QuickActions.tsx', 'Open Study Tracker'],
  ['reduced motion', 'src/styles/global/components.css', 'prefers-reduced-motion'],
  ['responsive layout', 'src/styles/global/components.css', 'max-width: 720px'],
];

let failed = false;
for (const file of required) {
  if (existsSync(resolve(root, file))) console.log(`PASS ${file}`);
  else { console.error(`FAIL missing ${file}`); failed = true; }
}
for (const [name, file, text] of checks) {
  const content = existsSync(resolve(root, file)) ? readFileSync(resolve(root, file), 'utf8') : '';
  if (content.includes(text)) console.log(`PASS ${name}`);
  else { console.error(`FAIL ${name}`); failed = true; }
}
const routes = readFileSync(resolve(root, 'src/app/routes/routePaths.ts'), 'utf8');
for (const path of ['/dashboard', '/academics/subjects', '/academics/assignments', '/academics/experiments', '/academics/projects', '/productivity/study', '/productivity/stopwatch', '/productivity/revision', '/productivity/habits', '/attendance', '/timetable', '/reports', '/settings']) {
  if (routes.includes(`'${path}'`)) console.log(`PASS route ${path}`);
  else { console.error(`FAIL route ${path}`); failed = true; }
}
if (readFileSync(resolve(root, 'src/components/layout/AppLayout.tsx'), 'utf8').includes('"/dashboard"')) {
  console.error('FAIL hard-coded navigation route found'); failed = true;
} else console.log('PASS centralized navigation routes');
if (readFileSync(resolve(root, 'src/pages/DashboardPage.tsx'), 'utf8').includes('Demo')) {
  console.error('FAIL hard-coded demo user in dashboard'); failed = true;
} else console.log('PASS no hard-coded dashboard user');
console.log(failed ? 'Phase 5 static audit: FAIL' : 'Phase 5 static audit: PASS');
process.exit(failed ? 1 : 0);
