import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

/** Every key is namespaced so the app's data can't collide with a library's. */
const KEY_PREFIX = 'streamshelf:';

/** A type guard that checks stored data still has the shape the app expects. */
export type IsValid<T> = (value: unknown) => value is T;

/**
 * Parses stored JSON and checks its shape. Corrupted text or an unexpected shape (e.g. data
 * written by an older app version) returns `null` instead of throwing, so a bad value can never
 * crash the app; callers treat it as "nothing stored".
 */
function parseStoredJson<T>(text: string, isValid: IsValid<T>, key: string): T | null {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    logger.warn(`Ignoring corrupted JSON in storage key "${key}"`, error);
    return null;
  }
  if (!isValid(value)) {
    logger.warn(`Ignoring JSON with an unexpected shape in storage key "${key}"`);
    return null;
  }
  return value;
}

/**
 * Persistent key-value storage (AsyncStorage) for what the app keeps between launches: My List
 * (Phase 5). Channel data isn't stored; it's downloaded each launch. This is the only module that
 * imports AsyncStorage (enforced by ESLint).
 *
 * Reads never throw: a missing, unreadable or corrupted value comes back as `null`. Writes do
 * throw, so the caller decides how to handle a failed save.
 */
export const storage = {
  async getString(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEY_PREFIX + key);
    } catch (error) {
      logger.error(`Failed to read "${key}" from storage`, error);
      return null;
    }
  },

  async setString(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(KEY_PREFIX + key, value);
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(KEY_PREFIX + key);
  },

  async getJson<T>(key: string, isValid: IsValid<T>): Promise<T | null> {
    const text = await storage.getString(key);
    return text === null ? null : parseStoredJson(text, isValid, key);
  },

  async setJson(key: string, value: unknown): Promise<void> {
    await storage.setString(key, JSON.stringify(value));
  },
};
