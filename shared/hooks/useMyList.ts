import { useMemo } from 'react';
import { useMyListStore } from '../state/myListStore';
import type { ChannelSummary, TileItem } from '../types/content';
import { useHomeRails } from './useHomeRails';

/** A saved channel, looked up in this launch's rails. */
export type MyListItem = TileItem & { addedAt: number };

export interface MyListState {
  /** Newest first. */
  items: MyListItem[];
  /** True until the saved list has been loaded from storage. */
  isLoading: boolean;
}

/**
 * The saved channels, newest first, each resolved against this launch's rails. Returns the same
 * object until the saved list, the rails or the loading state change.
 */
export function useMyList(): MyListState {
  const entries = useMyListStore((state) => state.entries);
  const hydrated = useMyListStore((state) => state.hydrated);
  const rails = useHomeRails();

  const items = useMemo(() => {
    const channels = new Map<string, ChannelSummary>();
    for (const { rail } of rails) {
      for (const channel of rail?.items ?? []) {
        if (!channels.has(channel.id)) channels.set(channel.id, channel);
      }
    }
    const allRailsLoaded = rails.every(({ rail, error }) => rail && !error);

    return entries.map(({ id, addedAt }): MyListItem => {
      const channel = channels.get(id);
      if (channel) return { status: 'available', id, addedAt, channel };
      return { status: allRailsLoaded ? 'unavailable' : 'pending', id, addedAt };
    });
  }, [entries, rails]);

  // Same object until the list, the rails or the loading state change, so memoised UI using it
  // doesn't re-render needlessly.
  return useMemo(() => ({ items, isLoading: !hydrated }), [items, hydrated]);
}
