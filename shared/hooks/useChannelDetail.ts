import { useMemo } from 'react';
import type { ApiError } from '../api/client';
import { describeChannel } from '../api/iptv/describeChannel';
import type { ChannelDetail } from '../types/content';
import { useChannelMetadata } from './useChannelMetadata';
import { useHomeRails } from './useHomeRails';

export interface ChannelDetailState {
  /** Available as soon as the channel is in a loaded rail; `metadata` fills in later. */
  detail: ChannelDetail | undefined;
  /** The channel isn't in the rails loaded so far, and some rails are still loading. */
  isLoading: boolean;
  isMetadataLoading: boolean;
  /**
   * The channel isn't in the loaded rails and a rail failed this launch, so it can't be shown
   * yet. `retry` reloads the failed rails.
   */
  error: ApiError | null;
  retry: () => void;
  /**
   * Every rail loaded and none contains this channel: iptv-org no longer lists it (e.g. a saved
   * My List channel). Only its id is known, so it can't be played, only removed from My List.
   */
  isUnavailable: boolean;
}

/**
 * Everything the Detail screen shows for one channel. Channel data always comes from this
 * launch's rails (already loaded on Home), so Detail renders immediately; metadata and the fuller
 * description arrive when the background metadata download finishes.
 */
export function useChannelDetail(channelId: string): ChannelDetailState {
  const rails = useHomeRails();
  const channels = useMemo(() => rails.flatMap(({ rail }) => rail?.items ?? []), [rails]);
  const channelIds = useMemo(() => [...new Set(channels.map((c) => c.id))], [channels]);
  const metadataResult = useChannelMetadata(channelIds);

  const summary = channels.find((channel) => channel.id === channelId);
  const metadata = metadataResult.data?.[channelId];
  const stillLoading = rails.some(({ isLoading }) => isLoading);
  const failedRails = rails.filter(({ error }) => error);
  const missing = !summary;

  const retry = useMemo(() => {
    const toRetry = rails.filter(({ error }) => error);
    return () => toRetry.forEach((rail) => rail.retry());
  }, [rails]);

  return {
    detail: summary && {
      summary,
      ...(metadata ? { metadata } : {}),
      description: describeChannel(summary, metadata),
    },
    isLoading: missing && stillLoading,
    isMetadataLoading: !missing && !metadataResult.data && metadataResult.isFetching,
    error: missing && !stillLoading ? (failedRails[0]?.error ?? null) : null,
    retry,
    isUnavailable: missing && !stillLoading && failedRails.length === 0,
  };
}
