import { useAuth } from '@/app/providers/AuthContext';
import { DashboardContent } from '@/features/dashboard';
import { StateView } from '@/components/ui/StateView';

export function DashboardPage() {
  const { currentUser } = useAuth();
  if (!currentUser) return <StateView state="loading" message="Loading your account…" />;
  return <DashboardContent user={currentUser} />;
}
