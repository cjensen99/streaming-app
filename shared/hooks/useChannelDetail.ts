import { useMemo } from 'react';
import { describeChannel } from '../api/iptv/describeChannel';
import type { ChannelDetail } from '../types/content';
import { useChannelMetadata } from './useChannelMetadata';
import { useHomeRails } from './useHomeRails';

export interface ChannelDetailState {
  /** Available as soon as the channel is in a loaded rail; `metadata` fills in later. */
  detail: ChannelDetail | undefined;
  /** Rails are still loading, so it's not known yet whether the channel exists. */
  isLoading: boolean;
  isMetadataLoading: boolean;
  /** Every rail has loaded and none contains this channel (e.g. a stale link). */
  notFound: boolean;
}

/**
 * Everything the Detail screen shows for one channel. The summary comes from the rails (already
 * loaded on Home), so Detail renders immediately; metadata and the fuller description arrive when
 * the background metadata download finishes. (Phase 5 adds My List as a second source.)
 */
export function useChannelDetail(channelId: string): ChannelDetailState {
  const rails = useHomeRails();
  const channels = useMemo(() => rails.flatMap(({ rail }) => rail?.items ?? []), [rails]);
  const channelIds = useMemo(() => [...new Set(channels.map((c) => c.id))], [channels]);
  const metadataResult = useChannelMetadata(channelIds);

  const summary = channels.find((channel) => channel.id === channelId);
  const metadata = metadataResult.data?.[channelId];
  const allSettled = rails.every(({ isLoading }) => !isLoading);

  return {
    detail: summary && {
      summary,
      ...(metadata ? { metadata } : {}),
      description: describeChannel(summary, metadata),
    },
    isLoading: !summary && !allSettled,
    isMetadataLoading: !!summary && !metadataResult.data && metadataResult.isFetching,
    notFound: !summary && allSettled,
  };
}
