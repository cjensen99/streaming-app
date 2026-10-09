import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { metadataQuery } from '../api/queries';
import { useHomeRails } from './useHomeRails';

/**
 * The channels to download metadata for: every channel in this launch's rails, once all three
 * have settled (loaded or failed); empty until then. Waiting for all of them means every caller
 * asks for the same set, so `channels.json` (~1 MB) downloads once rather than again as each
 * rail arrives.
 */
function useRailChannelIds(): string[] {
  const rails = useHomeRails();
  return useMemo(() => {
    if (rails.some(({ isLoading }) => isLoading)) return [];
    const ids = rails.flatMap(({ rail }) => rail?.items.map((channel) => channel.id) ?? []);
    return [...new Set(ids)];
  }, [rails]);
}

/**
 * Detail metadata for every channel in the rails, keyed by channel id, for screens that show it.
 * Re-renders as the download progresses.
 *
 * If the set of channels changes later (a failed rail loads on Retry), the previous metadata
 * stays available while the new set loads.
 */
export function useChannelMetadata() {
  const channelIds = useRailChannelIds();
  return useQuery({
    ...metadataQuery(channelIds),
    enabled: channelIds.length > 0,
    placeholderData: keepPreviousData,
  });
}

/**
 * Starts the same metadata download as soon as the rails settle, without subscribing to it, so
 * the caller (Home) doesn't re-render as it progresses. Detail then finds it ready. Offline, the
 * download waits for a connection; if it fails, Detail's own query tries again when it opens.
 */
export function usePrefetchChannelMetadata(): void {
  const client = useQueryClient();
  const channelIds = useRailChannelIds();
  useEffect(() => {
    if (channelIds.length > 0) void client.prefetchQuery(metadataQuery(channelIds));
  }, [client, channelIds]);
}
