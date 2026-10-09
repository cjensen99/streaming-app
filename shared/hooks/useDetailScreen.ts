import { useIsFocused } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { type ChannelFact, channelFacts } from '../api/iptv/channelFacts';
import { MY_LIST_LIMIT } from '../state/myListStore';
import { logger } from '../utils/logger';
import { type ChannelDetailState, useChannelDetail } from './useChannelDetail';
import { useMyListButton } from './useMyListButton';

export const MY_LIST_FULL_MESSAGE = `My List is full (${MY_LIST_LIMIT} channels). Remove one to add another.`;

export interface DetailScreenState extends ChannelDetailState {
  /** Detail is the screen showing, so it takes remote keys. */
  isActive: boolean;
  /** Labelled facts (country, categories…), only the known ones. Empty until the channel loads. */
  facts: ChannelFact[];
  website: string | undefined;
  isSaved: boolean;
  /** Adds or removes the channel; when My List is full, shows `fullMessage` instead of adding. */
  toggleMyList: () => void;
  /** Set after an Add was refused because My List is full; cleared once there's room again. */
  fullMessage: string | null;
  play: () => void;
}

export function useDetailScreen(channelId: string): DetailScreenState {
  const isActive = useIsFocused();
  const channel = useChannelDetail(channelId);
  const { isSaved, canAdd, toggle } = useMyListButton(channelId);
  const [addRefused, setAddRefused] = useState(false);

  const summary = channel.detail?.summary;
  const metadata = channel.detail?.metadata;
  const facts = useMemo(
    () => (summary ? channelFacts(summary, metadata) : []),
    [summary, metadata],
  );

  const toggleMyList = useCallback(() => {
    setAddRefused(!canAdd);
    if (canAdd) toggle();
  }, [canAdd, toggle]);

  // Playback arrives with the player (Phase 11); the button is in its final place already.
  const play = useCallback(
    () => logger.debug(`Play ${channelId} (not available yet)`),
    [channelId],
  );

  return {
    ...channel,
    isActive,
    facts,
    website: metadata?.website,
    isSaved,
    toggleMyList,
    fullMessage: addRefused && !canAdd ? MY_LIST_FULL_MESSAGE : null,
    play,
  };
}
