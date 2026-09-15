import type { Assignment } from '@/types';
import { createApiResource } from './resource';

export const assignmentsApi = createApiResource<Assignment>('assignments');
