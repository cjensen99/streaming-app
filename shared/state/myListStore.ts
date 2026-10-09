import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './persistStorage';

/**
 * My List: the channels the user saved. Only channel **ids** are stored (plus when each was
 * added); the channels themselves are looked up in each launch's rails, so a channel iptv-org no
 * longer lists can't be played (see `hooks/useMyList`).
 *
 * Screens never use this store directly; they use the hooks in `shared/hooks/`.
 */

export const MY_LIST_LIMIT = 50;

export interface MyListEntry {
  id: string;
  /** Milliseconds since epoch; the list is shown newest first. */
  addedAt: number;
}

/** What `add` did: added it, it was already saved, or the list is full. */
export type AddResult = 'added' | 'exists' | 'full';

interface MyListState {
  /** Newest first, unique ids, at most `MY_LIST_LIMIT`. */
  entries: MyListEntry[];
  /** False until the saved list has been loaded from storage (avoids an empty-list flash). */
  hydrated: boolean;
  add: (id: string) => AddResult;
  remove: (id: string) => void;
  has: (id: string) => boolean;
}

/** The part of the state that's saved. */
type PersistedMyList = Pick<MyListState, 'entries'>;

/** Bump with a `migrate` step whenever the saved shape changes. */
const STORE_VERSION = 1;

function isEntry(value: unknown): value is MyListEntry {
  if (typeof value !== 'object' || value === null) return false;
  const { id, addedAt } = value as Record<string, unknown>;
  return typeof id === 'string' && id.length > 0 && typeof addedAt === 'number';
}

/**
 * Cleans saved entries: drops invalid ones and duplicate ids, sorts newest first, applies the
 * limit. Storage is outside the app's control, so it's never trusted as-is.
 */
export function sanitizeEntries(value: unknown): MyListEntry[] {
  if (!Array.isArray(value)) return [];
  const newestFirst = value.filter(isEntry).sort((a, b) => b.addedAt - a.addedAt);
  const seen = new Set<string>();
  const unique: MyListEntry[] = [];
  for (const entry of newestFirst) {
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    unique.push(entry);
  }
  return unique.slice(0, MY_LIST_LIMIT);
}

export const useMyListStore = create<MyListState>()(
  persist(
    (set, get) => ({
      entries: [],
      hydrated: false,
      add: (id) => {
        const { entries } = get();
        if (entries.some((entry) => entry.id === id)) return 'exists';
        if (entries.length >= MY_LIST_LIMIT) return 'full';
        set({ entries: [{ id, addedAt: Date.now() }, ...entries] });
        return 'added';
      },
      remove: (id) => {
        const { entries } = get();
        if (entries.some((entry) => entry.id === id)) {
          set({ entries: entries.filter((entry) => entry.id !== id) });
        }
      },
      has: (id) => get().entries.some((entry) => entry.id === id),
    }),
    {
      name: 'my-list',
      version: STORE_VERSION,
      storage: createPersistStorage<PersistedMyList>(),
      partialize: ({ entries }) => ({ entries }),
      // No earlier versions exist yet; future shape changes add steps here.
      migrate: (persisted) => persisted as PersistedMyList,
      // Keep channels added while the saved list was loading, instead of overwriting them
      // (cleanup then drops duplicates, sorts and applies the limit). Loading takes milliseconds at
      // launch, so this is insurance rather than a path users can normally reach.
      merge: (persisted, current) => {
        const saved = (persisted as Partial<PersistedMyList> | undefined)?.entries;
        return {
          ...current,
          entries: sanitizeEntries([...current.entries, ...(Array.isArray(saved) ? saved : [])]),
        };
      },
      onRehydrateStorage: () => () => useMyListStore.setState({ hydrated: true }),
    },
  ),
);
