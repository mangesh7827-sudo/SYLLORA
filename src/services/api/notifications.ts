import type { Notification } from '@/types';
import { createApiResource } from './resource';

export const notificationsApi = createApiResource<Notification>('notifications');
