import type { Report } from '@/types';
import { createApiResource } from './resource';

export const reportsApi = createApiResource<Report>('reports');
