import type { AttendanceRecord } from '@/types';
import { createApiResource } from './resource';

export const attendanceApi = createApiResource<AttendanceRecord>('attendance');
