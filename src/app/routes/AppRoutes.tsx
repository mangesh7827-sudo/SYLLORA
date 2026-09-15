import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { routePaths } from './routePaths';
import { DesignSystemPage } from '@/pages/DesignSystemPage';
import { PageTransition } from '@/components/motion/PageTransition';
import { ProtectedRoute, PublicOnlyRoute } from '@/app/guards/AuthGuards';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SubjectsPage, SubjectDetailPage, ModuleDetailPage } from '@/features/academics';
import { StudyTrackerPage, StopwatchPage, RevisionPage } from '@/features/productivity';
import { AttendancePage, TimetablePage, AssignmentsPage, ExperimentsPage, HabitsPage } from '@/features/phase8';
import { ReportsPage } from '@/features/phase10/pages/ReportsPage';
import { SettingsPage } from '@/features/phase10/pages/SettingsPage';
import { ProjectsPage } from '@/features/phase10/pages/ProjectsPage';
import { RemindersPage } from '@/features/phase10/pages/RemindersPage';


export function AppRoutes() {
  return <PageTransition><Routes>
    <Route path={routePaths.designSystem} element={<DesignSystemPage />} />
    <Route path={routePaths.home} element={<Navigate to={routePaths.dashboard} replace />} />
    <Route element={<PublicOnlyRoute />}>
      <Route path={routePaths.login} element={<LoginPage />} />
      <Route path={routePaths.signup} element={<SignupPage />} />
      <Route path={routePaths.forgotPassword} element={<ForgotPasswordPage />} />
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path={routePaths.dashboard} element={<DashboardPage />} />
        <Route path={routePaths.academics} element={<Navigate to={routePaths.subjects} replace />} />
        <Route path={routePaths.subjects} element={<SubjectsPage />} />
        <Route path={`${routePaths.subjects}/:subjectId`} element={<SubjectDetailPage />} />
        <Route path={`${routePaths.subjects}/:subjectId/modules/:moduleId`} element={<ModuleDetailPage />} />
        <Route path={routePaths.modules} element={<Navigate to={routePaths.subjects} replace />} />
        <Route path={routePaths.topics} element={<Navigate to={routePaths.subjects} replace />} />
        <Route path={routePaths.assignments} element={<AssignmentsPage />} />
        <Route path={routePaths.experiments} element={<ExperimentsPage />} />
        <Route path={routePaths.projects} element={<ProjectsPage />} />
        <Route path={routePaths.productivity} element={<Navigate to={routePaths.study} replace />} />
        <Route path={routePaths.study} element={<StudyTrackerPage />} />
        <Route path={routePaths.stopwatch} element={<StopwatchPage />} />
        <Route path={routePaths.revision} element={<RevisionPage />} />
        <Route path={routePaths.habits} element={<HabitsPage />} />
        <Route path={routePaths.attendance} element={<AttendancePage />} />
        <Route path={routePaths.timetable} element={<TimetablePage />} />
        <Route path="/academics/attendance" element={<Navigate to={routePaths.attendance} replace />} />
        <Route path="/academics/timetable" element={<Navigate to={routePaths.timetable} replace />} />
        <Route path={routePaths.reports} element={<ReportsPage />} />
        <Route path={routePaths.analytics} element={<Navigate to={routePaths.reports} replace />} />
        <Route path={routePaths.settings} element={<SettingsPage />} />
        <Route path={routePaths.reminders} element={<RemindersPage />} />
      </Route>
    </Route>
    <Route path="*" element={<PlaceholderPage title="Page not found" description="The page you requested could not be found." />} />
  </Routes></PageTransition>;
}
