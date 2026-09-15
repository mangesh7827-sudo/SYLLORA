import type { Reminder } from '@/types';
import { createApiResource } from './resource';

export const remindersApi = createApiResource<Reminder>('reminders');
