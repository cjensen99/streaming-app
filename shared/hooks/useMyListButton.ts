import { useCallback } from 'react';
import { MY_LIST_LIMIT, useMyListStore } from '../state/myListStore';

export interface MyListButtonState {
  /** The channel is in My List (the button reads "Remove from My List"). */
  isSaved: boolean;
  /**
   * False only when pressing the button would be refused: the channel isn't saved and My List
   * already holds the maximum. (Removing always works, so a saved channel can always toggle.)
   */
  canAdd: boolean;
  /** Adds the channel, or removes it if it's saved. Does nothing when `canAdd` is false. */
  toggle: () => void;
}

/**
 * Everything the Add/Remove from My List button needs for one channel. Subscribes only to this
 * channel's saved state and to whether it could be added, so toggling another channel doesn't
 * re-render this button (unless the list fills up or frees a slot).
 */
export function useMyListButton(channelId: string): MyListButtonState {
  const isSaved = useMyListStore((state) => state.entries.some((entry) => entry.id === channelId));
  const hasRoom = useMyListStore((state) => state.entries.length < MY_LIST_LIMIT);

  const toggle = useCallback(() => {
    const { has, add, remove } = useMyListStore.getState();
    if (has(channelId)) remove(channelId);
    else add(channelId);
  }, [channelId]);

  return { isSaved, canAdd: isSaved || hasRoom, toggle };
}
