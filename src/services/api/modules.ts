import type { Module } from '@/types';
import { createApiResource } from './resource';

export const modulesApi = createApiResource<Module>('modules');
