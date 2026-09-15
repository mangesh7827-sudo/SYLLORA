import type { Subject } from '@/types';
import { createApiResource } from './resource';

export const subjectsApi = createApiResource<Subject>('subjects');
