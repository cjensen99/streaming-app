import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCallback, useEffect } from 'react';
import { usePrefetchChannelMetadata } from './useChannelMetadata';
import { type HomeRail, useHomeRails } from './useHomeRails';
import { type MyListState, useMyList } from './useMyList';

/** Logos of the first loaded rail are fetched ahead, so the first tiles appear with images. */
const PREFETCH_LOGO_COUNT = 10;

export interface HomeScreenState {
  myList: MyListState;
  rails: HomeRail[];
  /** Every category rail failed: Home shows one full-screen error instead of three. */
  allRailsFailed: boolean;
  retryAllRails: () => void;
  /** Opens Detail for a channel. Stable, so tiles can be memoised. */
  openChannel: (channelId: string) => void;
}

export function useHomeScreen(): HomeScreenState {
  const navigation = useNavigation();
  const rails = useHomeRails();
  const myList = useMyList();
  // Starts the background metadata download as soon as the rails settle, so Detail is complete
  // when it opens. Home doesn't show metadata, so it doesn't subscribe to it.
  usePrefetchChannelMetadata();
  usePrefetchFirstLogos(rails);

  const openChannel = useCallback(
    (channelId: string) => navigation.navigate('Detail', { channelId }),
    [navigation],
  );
  const retryAllRails = useCallback(() => rails.forEach((rail) => rail.retry()), [rails]);

  return {
    myList,
    rails,
    allRailsFailed: rails.every(({ error }) => error),
    retryAllRails,
    openChannel,
  };
}

function usePrefetchFirstLogos(rails: HomeRail[]): void {
  // A string, so the effect only runs again when the URLs actually change.
  const firstLogos = rails
    .find(({ rail }) => rail && rail.items.length > 0)
    ?.rail?.items.slice(0, PREFETCH_LOGO_COUNT)
    .flatMap((channel) => (channel.logoUrl ? [channel.logoUrl] : []))
    .join('\n');
  useEffect(() => {
    if (firstLogos) void Image.prefetch(firstLogos.split('\n'));
  }, [firstLogos]);
}
