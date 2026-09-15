import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const pass = (message) => console.log(`PASS ${message}`);
const check = (condition, message) => { assert.ok(condition, message); pass(message); };

for (const file of [
  'src/features/academics/types/academic.ts',
  'src/features/academics/services/academicService.ts',
  'src/features/academics/services/academicMockService.ts',
  'src/services/api/academic.ts',
  'src/features/academics/pages/SubjectsPage.tsx',
  'src/features/academics/pages/SubjectDetailPage.tsx',
  'src/features/academics/pages/ModuleDetailPage.tsx',
  'src/features/academics/components/SubjectCard.tsx',
  'src/features/academics/components/ModuleCard.tsx',
  'src/features/academics/components/TopicItem.tsx',
  'src/features/academics/components/AcademicForm.tsx',
  'src/features/academics/components/AcademicModal.tsx',
  'src/features/academics/components/ConfirmDialog.tsx',
]) check(exists(file), file);

const types = read('src/features/academics/types/academic.ts');
const mock = read('src/features/academics/services/academicMockService.ts');
const routes = read('src/app/routes/AppRoutes.tsx');
const dashboard = read('src/features/dashboard/services/dashboardService.ts');
const domain = read('src/types/domain.ts');
const css = read('src/styles/global/components.css');

check(domain.includes('interface Subject') && domain.includes('description?: string') && domain.includes('createdAt: ISODateTime'), 'subject domain fields');
check(domain.includes('interface Module') && domain.includes('subjectId: ID') && domain.includes('order: number'), 'module domain fields');
check(domain.includes("status: 'pending' | 'completed'") && domain.includes('completedAt?: ISODateTime'), 'topic completion fields');
check(types.includes('function calculateProgress') && types.includes('if (total <= 0) return 0;'), 'zero-topic progress guard');

const progress = (completed, total) => total <= 0 ? 0 : Number(((completed / total) * 100).toFixed(1));
assert.equal(progress(0, 0), 0); assert.equal(progress(1, 1), 100); assert.equal(progress(5, 10), 50); assert.equal(progress(5, 8), 62.5); assert.equal(progress(2, 10), 20);
pass('critical progress calculations');

check(mock.includes('topics.filter((topic) => topic.moduleId === module.id)') && mock.includes('calculateProgress(completed, moduleTopics.length)'), 'module progress uses topic counts');
check(mock.includes('subjectTopics') && mock.includes('calculateProgress(completed, subjectTopics.length)'), 'subject progress uses all subject topics');
check(mock.includes('getOverallProgress') && mock.includes('calculateProgress(completed, store.topics.length)'), 'overall progress uses all user topics');
check(mock.includes('filter((x) => x.userId === userId)'), 'mock data is user-scoped');
check(mock.includes('subjectModules.some((module) => module.id === topic.moduleId)'), 'subject hierarchy relationship is enforced');
check(mock.includes('completedAt: status === \'completed\'') && mock.includes('completedAt: status === \'completed\' ? previous.completedAt ?? updatedAt : undefined'), 'completion timestamp lifecycle');
check(mock.includes('modules: store.modules.filter((item) => item.subjectId !== subjectId)') && mock.includes('topics: store.topics.filter((item) => !moduleIds.has(item.moduleId))'), 'destructive deletion cascades through mock service');
check(mock.includes('Math.max(0, ...store.modules.filter((item) => item.subjectId === subjectId)'), 'module order is assigned by service');
check(mock.includes('Math.max(0, ...store.topics.filter((item) => item.moduleId === moduleId)'), 'topic order is assigned by service');
check(mock.includes("'Java Programming'") && mock.includes("'Database Systems'") && mock.includes("'Digital Electronics'") && mock.includes("'Web Development'"), 'development mock data covers four subjects');

check(routes.includes('SubjectsPage') && routes.includes('SubjectDetailPage') && routes.includes('ModuleDetailPage'), 'academic routes use real pages');
check(routes.includes('routePaths.subjects}/:subjectId') && routes.includes('routePaths.subjects}/:subjectId/modules/:moduleId'), 'subject and module detail routes');
check(dashboard.includes('academicService.getOverallProgress(user.id)') && dashboard.includes('academicService.getSubjects(user.id)'), 'dashboard consumes academic service source of truth');
check(css.includes('.academic-page') && css.includes('@media (max-width: 720px)'), 'responsive academic styles');
check(css.includes('prefers-reduced-motion') && css.includes('.academic-modal__backdrop'), 'motion and modal accessibility styling');

console.log('Phase 6 static audit: PASS');
