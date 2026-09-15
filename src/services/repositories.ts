import type { ID } from '@/types';

export interface Repository<T extends { id: ID; userId: ID }> {
  list(userId: ID): Promise<T[]>;
  getById(userId: ID, id: ID): Promise<T | null>;
}

export function createMockRepository<T extends { id: ID; userId: ID }>(records: readonly T[]): Repository<T> {
  return {
    async list(userId) {
      return records.filter((record) => record.userId === userId);
    },
    async getById(userId, id) {
      return records.find((record) => record.userId === userId && record.id === id) ?? null;
    },
  };
}
