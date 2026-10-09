import { useCallback } from 'react';
import { MY_LIST_LIMIT, useMyListStore } from '../state/myListStore';

export interface MyListButtonState {
  /** The channel is in My List (the button reads "Remove from My List"). */
  isSaved: boolean;
  /** My List holds the maximum number of channels, so another can't be added. */
  isFull: boolean;
  /** Adds the channel, or removes it if it's saved. Does nothing if adding to a full list. */
  toggle: () => void;
}

/**
 * Everything the Add/Remove from My List button needs for one channel. Subscribes only to this
 * channel's saved state and to whether the list is full, so toggling another channel doesn't
 * re-render this button.
 */
export function useMyListButton(channelId: string): MyListButtonState {
  const isSaved = useMyListStore((state) => state.entries.some((entry) => entry.id === channelId));
  const isFull = useMyListStore((state) => state.entries.length >= MY_LIST_LIMIT);

  const toggle = useCallback(() => {
    const { has, add, remove } = useMyListStore.getState();
    if (has(channelId)) remove(channelId);
    else add(channelId);
  }, [channelId]);

  return { isSaved, isFull, toggle };
}
