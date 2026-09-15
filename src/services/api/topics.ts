import type { Topic } from '@/types';
import { createApiResource } from './resource';

export const topicsApi = createApiResource<Topic>('topics');
