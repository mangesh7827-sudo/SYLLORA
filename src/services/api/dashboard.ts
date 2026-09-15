import type { DashboardData } from '@/features/dashboard/types/dashboard';
import type { User } from '@/types';
import { buildDashboard } from '@/features/dashboard/services/dashboardService';
export const dashboardApi={getCurrentUserDashboard(user:User):Promise<DashboardData>{return buildDashboard(user);}};
