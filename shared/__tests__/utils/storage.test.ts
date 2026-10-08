import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../utils/logger';
import { storage } from '../../utils/storage';

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
});

describe('storage', () => {
  it('round-trips JSON under a namespaced key', async () => {
    await storage.setJson('my-list', ['a', 'b']);

    expect(await storage.getJson('my-list', isStringArray)).toEqual(['a', 'b']);
    expect(await AsyncStorage.getItem('streamshelf:my-list')).toBe('["a","b"]');
  });

  it('returns null for a missing key', async () => {
    expect(await storage.getJson('missing', isStringArray)).toBeNull();
  });

  it('returns null instead of throwing for corrupted JSON', async () => {
    await AsyncStorage.setItem('streamshelf:my-list', '{not json');

    expect(await storage.getJson('my-list', isStringArray)).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('corrupted JSON'),
      expect.anything(),
    );
  });

  it('returns null for JSON with an unexpected shape', async () => {
    await storage.setJson('my-list', { not: 'a list' });

    expect(await storage.getJson('my-list', isStringArray)).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('unexpected shape'));
  });

  it('removes a value', async () => {
    await storage.setString('flag', 'on');
    await storage.remove('flag');

    expect(await storage.getString('flag')).toBeNull();
  });
});
