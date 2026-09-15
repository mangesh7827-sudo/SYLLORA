import type { TimetableEntry } from '@/types';
import { createApiResource } from './resource';

export const timetableApi = createApiResource<TimetableEntry>('timetable');
