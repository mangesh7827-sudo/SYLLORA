import type { Experiment } from '@/types';
import { createApiResource } from './resource';

export const experimentsApi = createApiResource<Experiment>('experiments');
