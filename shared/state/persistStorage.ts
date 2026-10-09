import type { PersistStorage, StorageValue } from 'zustand/middleware';
import { logger } from '../utils/logger';
import { storage } from '../utils/storage';

/** Checks the `{ state, version }` envelope Zustand saves; each store validates its own state. */
function isStorageValue(value: unknown): value is StorageValue<unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const { state, version } = value as Record<string, unknown>;
  return typeof state === 'object' && state !== null && typeof version === 'number';
}

/**
 * Storage for Zustand's `persist` middleware, through `utils/storage` (AsyncStorage). A missing,
 * corrupted or wrongly shaped saved value reads as "nothing saved", so a store starts empty
 * instead of crashing. A failed save is logged rather than thrown (the in-memory state is still
 * correct; it will be saved again on the next change).
 */
export function createPersistStorage<S>(): PersistStorage<S> {
  return {
    getItem: (name) => storage.getJson(name, isStorageValue) as Promise<StorageValue<S> | null>,
    setItem: async (name, value) => {
      try {
        await storage.setJson(name, value);
      } catch (error) {
        logger.error(`Failed to save "${name}"`, error);
      }
    },
    removeItem: (name) => storage.remove(name),
  };
}
