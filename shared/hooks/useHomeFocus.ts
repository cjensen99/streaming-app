import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import type { RailId } from '../api/iptv/rails';
import type { FocusRailHandle } from '../focus/types';
import type { HomeRail } from './useHomeRails';
import { useLatest } from './useLatest';
import type { MyListState } from './useMyList';

/** Home's rails, as the focus rules refer to them: My List, then the category rails. */
export type HomeRailKey = 'my-list' | RailId;
export const MY_LIST_RAIL: HomeRailKey = 'my-list';

export interface HomeFocusState {
  /** Home is the screen showing, so it takes remote keys. */
  isActive: boolean;
  /**
   * The rail whose first tile takes focus when Home opens: My List, else the first with tiles.
   * Undefined while a rail above the first one with tiles is still loading.
   */
  defaultFocusRail: HomeRailKey | undefined;
  /** A stable ref callback per rail, so Home can focus one of its tiles. */
  railRef: (rail: HomeRailKey) => (handle: FocusRailHandle | null) => void;
  /** Call when a tile opens Detail, so coming back can check it's still there. */
  noteOpened: (channelId: string, rail: HomeRailKey) => void;
}

/**
 * Home's focus rules (TVs). Focus starts on My List's first tile, else the first rail with tiles.
 * Coming back from Detail, the focus system returns to the tile that was opened by itself; the
 * exception is a My List channel removed on Detail: its tile is gone, so focus goes to the start
 * of My List, or to the next rail with tiles if My List is now empty.
 */
export function useHomeFocus(myList: MyListState, rails: HomeRail[]): HomeFocusState {
  const isActive = useIsFocused();

  const defaultFocusRail = startingRail(myList, rails);
  const railsWithTiles: HomeRailKey[] = [
    ...(!myList.isLoading && myList.items.length > 0 ? [MY_LIST_RAIL] : []),
    ...rails.filter(({ rail }) => rail && rail.items.length > 0).map(({ config }) => config.id),
  ];

  const handles = useRef(new Map<HomeRailKey, FocusRailHandle>());
  const refCallbacks = useRef(new Map<HomeRailKey, (handle: FocusRailHandle | null) => void>());
  const railRef = useCallback((rail: HomeRailKey) => {
    let callback = refCallbacks.current.get(rail);
    if (!callback) {
      callback = (handle) => {
        if (handle) handles.current.set(rail, handle);
        else handles.current.delete(rail);
      };
      refCallbacks.current.set(rail, callback);
    }
    return callback;
  }, []);

  const opened = useRef<{ channelId: string; rail: HomeRailKey } | null>(null);
  const noteOpened = useCallback((channelId: string, rail: HomeRailKey) => {
    opened.current = { channelId, rail };
  }, []);

  const latest = useLatest({ railsWithTiles, myListItems: myList.items });
  useFocusEffect(
    useCallback(() => {
      const last = opened.current;
      opened.current = null;
      if (last?.rail !== MY_LIST_RAIL) return;
      const { railsWithTiles: current, myListItems } = latest.current;
      if (myListItems.some(({ id }) => id === last.channelId)) return;
      const target = current[0];
      if (target) handles.current.get(target)?.focus(0);
    }, [latest]),
  );

  return { isActive, defaultFocusRail, railRef, noteOpened };
}

/**
 * The rail Home's focus starts on: the first one, top to bottom, with tiles. A rail that's still
 * loading might get tiles, so nothing below it is chosen until it has settled; otherwise a lower
 * rail that loads first would take the focus.
 */
function startingRail(myList: MyListState, rails: HomeRail[]): HomeRailKey | undefined {
  if (myList.isLoading) return undefined;
  if (myList.items.length > 0) return MY_LIST_RAIL;
  for (const { config, rail, isLoading } of rails) {
    if (isLoading) return undefined;
    if (rail && rail.items.length > 0) return config.id;
  }
  return undefined;
}
