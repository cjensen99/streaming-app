import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { metadataQuery } from '../api/queries';

/**
 * Detail metadata for a set of channels, keyed by channel id. Downloads `channels.json` (~1 MB)
 * in the background, so pass ids only once the rails have loaded (an empty list waits).
 *
 * When the set of channels changes (e.g. the rails refresh), the previous metadata stays
 * available while the new set loads.
 */
export function useChannelMetadata(channelIds: readonly string[]) {
  return useQuery({
    ...metadataQuery(channelIds),
    enabled: channelIds.length > 0,
    placeholderData: keepPreviousData,
  });
}
