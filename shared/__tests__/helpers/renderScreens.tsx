import { jest } from '@jest/globals';
import { NavigationContainer, type InitialState } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CHANNELS_URL, COUNTRIES_URL } from '../../api/iptv/metadata';
import { categoryPlaylistUrl, ENGLISH_PLAYLIST_URL } from '../../api/iptv/rails';
import { AppContent } from '../../screens/AppShell';
import { RootNavigator } from '../../screens/RootNavigator';
import { useMyListStore } from '../../state/myListStore';
import { logger } from '../../utils/logger';
import { fixture, type MockRoute } from './mockFetch';
import { createQueryWrapper } from './queryWrapper';

/**
 * Every iptv-org URL the app requests, answered from the fixtures: News → ABC News Live and
 * Bloomberg TV; Sports → ABC News Live and ESPNews; Movies → empty. Override any route.
 *
 * The background metadata download never answers, unless a test spreads in `metadataRoutes`: it
 * starts on its own once the rails load, and would otherwise finish after tests that don't wait
 * for it.
 */
export const appRoutes = (
  overrides: Record<string, MockRoute> = {},
): Record<string, MockRoute> => ({
  [ENGLISH_PLAYLIST_URL]: fixture('eng.m3u'),
  [categoryPlaylistUrl('news')]: fixture('news.m3u'),
  [categoryPlaylistUrl('sports')]: fixture('sports.m3u'),
  [categoryPlaylistUrl('movies')]: '#EXTM3U\n',
  [CHANNELS_URL]: { pending: true },
  [COUNTRIES_URL]: { pending: true },
  ...overrides,
});

/** Answers the metadata download from the fixtures (ABC News Live: ABC, US, since 2014). */
export const metadataRoutes = (): Record<string, MockRoute> => ({
  [CHANNELS_URL]: fixture('channels.json'),
  [COUNTRIES_URL]: fixture('countries.json'),
});

/** An empty, loaded My List, quiet request logs and empty storage: call in `beforeEach`. */
export async function resetAppState() {
  jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
  jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
  useMyListStore.setState({ entries: [], hydrated: true });
  await AsyncStorage.clear();
}

/** The whole app (screens, splash, not-connected cover) with a fresh QueryClient. */
export async function renderApp() {
  const { wrapper: QueryWrapper } = createQueryWrapper();
  await render(
    <SafeAreaProvider>
      <QueryWrapper>
        <AppContent />
      </QueryWrapper>
    </SafeAreaProvider>,
  );
}

/** The navigator opened straight on one channel's Detail screen. */
export async function renderDetail(channelId: string) {
  const { wrapper: QueryWrapper } = createQueryWrapper();
  const initialState: InitialState = {
    routes: [{ name: 'Detail', params: { channelId } }],
  };
  await render(
    <SafeAreaProvider>
      <QueryWrapper>
        <NavigationContainer initialState={initialState}>
          <RootNavigator />
        </NavigationContainer>
      </QueryWrapper>
    </SafeAreaProvider>,
  );
}
