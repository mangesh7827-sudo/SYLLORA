import type { Habit } from '@/types';
import { createApiResource } from './resource';

export const habitsApi = createApiResource<Habit>('habits');
