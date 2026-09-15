import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { StateView } from '@/components/ui/StateView';
import { routePaths } from '@/app/routes/routePaths';
import { useAuth } from '@/app/providers/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="auth-route-loader"><StateView state="loading" message="Checking your session…" /></div>;
  if (!isAuthenticated) return <Navigate to={routePaths.login} replace state={{ from: location }} />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="auth-route-loader"><StateView state="loading" message="Checking your session…" /></div>;
  if (isAuthenticated) return <Navigate to={routePaths.dashboard} replace />;
  return <Outlet />;
}
