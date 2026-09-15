export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export const localStorageAdapter: StorageAdapter = {
  get<T>(key: string) {
    const storage = getStorage();
    if (!storage) return null;

    const raw = storage.getItem(key);
    if (raw === null) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      storage.removeItem(key);
      return null;
    }
  },
  set<T>(key: string, value: T) {
    const storage = getStorage();
    storage?.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    getStorage()?.removeItem(key);
  },
};
