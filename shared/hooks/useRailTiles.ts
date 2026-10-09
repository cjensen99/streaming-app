import { useMemo } from 'react';
import type { Rail, TileItem } from '../types/content';

/**
 * A category rail's channels as tiles. Returns the same array until the rail changes, so the
 * rail's (memoised) tiles don't re-render when another rail loads.
 */
export function useRailTiles(rail: Rail | undefined): TileItem[] | undefined {
  return useMemo(
    () =>
      rail?.items.map((channel): TileItem => ({ status: 'available', id: channel.id, channel })),
    [rail],
  );
}
