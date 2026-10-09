import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MY_LIST_LIMIT,
  type MyListEntry,
  sanitizeEntries,
  useMyListStore,
} from '../../state/myListStore';
import { logger } from '../../utils/logger';

const STORAGE_KEY = 'streamshelf:my-list';
const store = () => useMyListStore.getState();
const ids = () => store().entries.map((entry) => entry.id);

let now = 1_000;
beforeEach(async () => {
  now = 1_000;
  jest.spyOn(Date, 'now').mockImplementation(() => now++);
  jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
  useMyListStore.setState({ entries: [], hydrated: true });
  await AsyncStorage.clear();
});

/** Lets pending async saves finish. */
const flush = () => new Promise((resolve) => setImmediate(resolve));

/**
 * Simulates an app restart: in-memory state is gone, then the saved list (or `saved`, to test
 * bad data) is loaded again. Clearing the state makes the store save the empty list, so the
 * saved data is put back afterwards, as it would be on a real restart.
 */
async function restart(saved?: string) {
  await flush();
  const toRestore = saved ?? (await AsyncStorage.getItem(STORAGE_KEY));
  useMyListStore.setState({ entries: [], hydrated: false });
  await flush();
  if (toRestore === null) await AsyncStorage.removeItem(STORAGE_KEY);
  else await AsyncStorage.setItem(STORAGE_KEY, toRestore);
  await useMyListStore.persist.rehydrate();
}

describe('My List store', () => {
  it('adds ids newest first and reports what happened', () => {
    expect(store().add('A.us')).toBe('added');
    expect(store().add('B.us')).toBe('added');

    expect(ids()).toEqual(['B.us', 'A.us']);
    expect(store().has('A.us')).toBe(true);
    expect(store().has('C.us')).toBe(false);
  });

  it('ignores adding a channel that is already saved (one entry per channel)', () => {
    store().add('A.us');
    expect(store().add('A.us')).toBe('exists');
    expect(ids()).toEqual(['A.us']);
  });

  it('removes an id, and ignores removing one that is not saved', () => {
    store().add('A.us');
    store().add('B.us');
    store().remove('A.us');
    store().remove('Unknown.us');

    expect(ids()).toEqual(['B.us']);
  });

  it(`refuses a channel beyond ${MY_LIST_LIMIT}, while removing still works`, () => {
    for (let i = 0; i < MY_LIST_LIMIT; i++) store().add(`C${i}.us`);

    expect(store().add('OneTooMany.us')).toBe('full');
    expect(store().entries).toHaveLength(MY_LIST_LIMIT);

    store().remove('C0.us');
    expect(store().add('OneTooMany.us')).toBe('added');
  });
});

describe('My List persistence', () => {
  it('saves only ids and dates, and restores them after a restart', async () => {
    store().add('A.us');
    store().add('B.us');
    await flush();

    expect(JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) ?? '')).toEqual({
      state: {
        entries: [
          { id: 'B.us', addedAt: 1_001 },
          { id: 'A.us', addedAt: 1_000 },
        ],
      },
      version: 1,
    });

    await restart();
    expect(ids()).toEqual(['B.us', 'A.us']);
    expect(store().hydrated).toBe(true);
  });

  it('starts empty instead of crashing when the saved data is corrupted', async () => {
    await restart('{"state":{"entries":[{"id":');

    expect(ids()).toEqual([]);
    expect(store().hydrated).toBe(true);
    expect(logger.warn).toHaveBeenCalled();
  });

  it('starts empty when the saved data has an unexpected shape', async () => {
    await restart(JSON.stringify({ state: { entries: 'not a list' }, version: 1 }));
    expect(ids()).toEqual([]);
  });

  it('keeps a channel added while the saved list is still loading', async () => {
    useMyListStore.setState({ entries: [], hydrated: false });
    await flush();
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { entries: [{ id: 'Saved.us', addedAt: 1 }] }, version: 1 }),
    );

    const loading = useMyListStore.persist.rehydrate();
    store().add('AddedDuringLoad.us');
    await loading;
    await flush();

    expect(ids()).toEqual(['AddedDuringLoad.us', 'Saved.us']);
    expect(await AsyncStorage.getItem(STORAGE_KEY)).toContain('AddedDuringLoad.us');
  });

  it('loads data saved by an older store version', async () => {
    await restart(JSON.stringify({ state: { entries: [{ id: 'A.us', addedAt: 5 }] }, version: 0 }));
    expect(ids()).toEqual(['A.us']);
  });
});

describe('sanitizeEntries', () => {
  it('drops invalid entries and duplicates, sorts newest first, and applies the limit', () => {
    const saved: unknown[] = [
      { id: 'Old.us', addedAt: 1 },
      { id: 'New.us', addedAt: 3 },
      { id: 'New.us', addedAt: 2 }, // duplicate: the newest one is kept
      { id: '', addedAt: 4 },
      { id: 'NoDate.us' },
      'garbage',
      ...Array.from({ length: MY_LIST_LIMIT }, (_, i) => ({ id: `Bulk${i}.us`, addedAt: 0 })),
    ];

    const entries: MyListEntry[] = sanitizeEntries(saved);

    expect(entries.slice(0, 2)).toEqual([
      { id: 'New.us', addedAt: 3 },
      { id: 'Old.us', addedAt: 1 },
    ]);
    expect(entries).toHaveLength(MY_LIST_LIMIT);
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(MY_LIST_LIMIT);
  });

  it('returns an empty list for anything that is not a list', () => {
    expect(sanitizeEntries(undefined)).toEqual([]);
    expect(sanitizeEntries({ id: 'A.us' })).toEqual([]);
  });
});
