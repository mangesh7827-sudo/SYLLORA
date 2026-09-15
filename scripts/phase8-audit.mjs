import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root=process.cwd();
const must=[
'src/features/phase8/components/AttendancePage.tsx','src/features/phase8/components/TimetablePage.tsx','src/features/phase8/components/AssignmentsPage.tsx','src/features/phase8/components/ExperimentsPage.tsx','src/features/phase8/components/HabitsPage.tsx',
'src/features/phase8/services/mockAttendanceService.ts','src/features/phase8/services/mockTimetableService.ts','src/features/phase8/services/mockAssignmentService.ts','src/features/phase8/services/mockExperimentService.ts','src/features/phase8/services/mockHabitService.ts','src/features/phase8/services/apiPhase8.ts','src/features/phase8/utils/calculations.ts'];
let failed=0; for(const f of must){if(!existsSync(resolve(root,f))){console.error(`FAIL missing ${f}`);failed++;}else console.log(`PASS ${f}`)}
const calc=readFileSync(resolve(root,'src/features/phase8/utils/calculations.ts'),'utf8');
for(const [label,needle] of [['zero attendance guard','total<=0?0'],['weighted overall','calculateOverallAttendance'],['status calculation','calculateAttendanceStatus'],['projection','calculateRequiredAttendanceProjection'],['assignment due state','assignmentDueState'],['experiment progress','calculateExperimentProgress'],['habit streak','calculateHabitStreak']]){if(calc.includes(needle))console.log(`PASS ${label}`);else{console.error(`FAIL ${label}`);failed++;}}
const routes=readFileSync(resolve(root,'src/app/routes/AppRoutes.tsx'),'utf8'); for(const p of ['routePaths.attendance','routePaths.timetable','routePaths.assignments','routePaths.experiments','routePaths.habits']){if(routes.includes(`path={${p}}`))console.log(`PASS route ${p}`);else{console.error(`FAIL route ${p}`);failed++;}}
const all=readFileSync(resolve(root,'src/features/phase8/services/mockAttendanceService.ts'),'utf8')+readFileSync(resolve(root,'src/features/phase8/services/mockTimetableService.ts'),'utf8')+readFileSync(resolve(root,'src/features/phase8/services/mockAssignmentService.ts'),'utf8')+readFileSync(resolve(root,'src/features/phase8/services/mockExperimentService.ts'),'utf8')+readFileSync(resolve(root,'src/features/phase8/services/mockHabitService.ts'),'utf8');
for(const needle of ['userId','academicService.getSubjects','persistUserStore']){if(all.includes(needle))console.log(`PASS ownership/relationship ${needle}`);else{console.error(`FAIL ownership/relationship ${needle}`);failed++;}}
if(all.includes('postgres')||all.includes('PostgreSQL')){console.error('FAIL Phase 9 database dependency found');failed++;}else console.log('PASS no PostgreSQL dependency in Phase 8 services');
console.log(failed?'Phase 8 static audit: FAIL':'Phase 8 static audit: PASS'); process.exitCode=failed?1:0;
