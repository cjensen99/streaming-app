import { type UseQueryResult, useQueries, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import type { ApiError } from '../api/client';
import { RAIL_CONFIG, type RailConfig } from '../api/iptv/rails';
import { railQuery } from '../api/queries';
import type { Rail } from '../types/content';

export interface HomeRail {
  config: RailConfig;
  /** Undefined until the rail has downloaded (once per launch). */
  rail: Rail | undefined;
  /** True until the rail has data: downloading, or waiting for a connection. */
  isLoading: boolean;
  error: ApiError | null;
  retry: () => void;
}

/** Logos of the first loaded rail are fetched ahead, so the first tiles appear with images. */
const PREFETCH_LOGO_COUNT = 10;

/**
 * Builds the hook's result. React Query only re-runs this when a rail's query result changes
 * (and it's defined once, outside the hook), so between changes the hook returns the very same
 * array and objects, and memoised rails and tiles don't re-render.
 */
function toHomeRails(results: UseQueryResult<Rail, ApiError>[]): HomeRail[] {
  return results.map((result, index) => ({
    config: RAIL_CONFIG[index] as RailConfig,
    rail: result.data,
    isLoading: result.isPending,
    error: result.error,
    retry: () => void result.refetch(),
  }));
}

/**
 * Home's three category rails. Each loads (and fails) independently, so one broken playlist
 * doesn't hide the others. The returned array and its items keep their identity until a rail's
 * data or status actually changes.
 */
export function useHomeRails(): HomeRail[] {
  const client = useQueryClient();
  const rails = useQueries({
    queries: RAIL_CONFIG.map((config) => railQuery(client, config)),
    combine: toHomeRails,
  });

  const firstLogos = rails
    .find(({ rail }) => rail && rail.items.length > 0)
    ?.rail?.items.slice(0, PREFETCH_LOGO_COUNT)
    .flatMap((channel) => (channel.logoUrl ? [channel.logoUrl] : []))
    .join('\n');
  useEffect(() => {
    if (firstLogos) void Image.prefetch(firstLogos.split('\n'));
  }, [firstLogos]);

  return rails;
}
