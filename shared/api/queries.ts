import { isCancelledError, type QueryClient, queryOptions } from '@tanstack/react-query';
import { logger } from '../utils/logger';
import { ApiError } from './client';
import { stableHash } from './hash';
import { fetchChannelMetadata } from './iptv/metadata';
import { fetchEnglishFeedKeys, fetchRail, type RailConfig } from './iptv/rails';
import { queryKeys } from './queryKeys';

/**
 * React Query definitions for iptv-org data. Hooks in `shared/hooks/` use these; nothing else
 * calls the fetchers directly.
 */

/**
 * Runs a query function so that it can only fail with an `ApiError`, which is what React Query
 * is told to expect (see `queryClient.ts`). The client already throws ApiErrors; anything else is
 * a bug (e.g. a TypeError while parsing), reported as `parse` so screens still get a `kind`.
 * React Query's own cancellation is passed through untouched.
 */
export async function asApiErrors<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof ApiError || isCancelledError(error)) throw error;
    logger.error('Unexpected error while loading channel data', error);
    throw new ApiError('parse', error instanceof Error ? error.message : String(error));
  }
}

const englishFeedsQuery = queryOptions({
  queryKey: queryKeys.englishFeeds,
  queryFn: ({ signal }) => asApiErrors(() => fetchEnglishFeedKeys({ signal })),
});

/**
 * One category rail. The English feed list is fetched inside the rail query (and shared by all
 * three rails), so it downloads once per launch.
 */
export function railQuery(client: QueryClient, config: RailConfig) {
  return queryOptions({
    queryKey: queryKeys.rail(config.id),
    queryFn: ({ signal }) =>
      asApiErrors(async () => {
        const englishFeedKeys = await client.fetchQuery(englishFeedsQuery);
        return fetchRail(config, new Set(englishFeedKeys), { signal });
      }),
  });
}

/** Stable key for a set of channel ids, independent of order and duplicates. */
export const channelsKey = (channelIds: readonly string[]) =>
  stableHash([...new Set(channelIds)].sort().join('|'));

/** Detail metadata for a set of channels (those in the rails, later also My List). */
export function metadataQuery(channelIds: readonly string[]) {
  return queryOptions({
    queryKey: queryKeys.metadata(channelsKey(channelIds)),
    queryFn: ({ signal }) => asApiErrors(() => fetchChannelMetadata(channelIds, { signal })),
  });
}
