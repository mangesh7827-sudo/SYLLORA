import type { Project } from '@/types';
import { createApiResource } from './resource';

export const projectsApi = createApiResource<Project>('projects');
