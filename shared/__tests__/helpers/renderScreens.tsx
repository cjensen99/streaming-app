import { jest } from '@jest/globals';
import { NavigationContainer, type InitialState } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CHANNELS_URL, COUNTRIES_URL } from '../../api/iptv/metadata';
import { categoryPlaylistUrl, ENGLISH_PLAYLIST_URL } from '../../api/iptv/rails';
import type { InputAdapter } from '../../input/adapters/InputAdapter';
import { sendKeyToFocus } from '../../focus/focusKeys';
import { InputProvider } from '../../input/InputProvider';
import type { AppKey, Dispatch, InputResult } from '../../input/keys';
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

/** Longer than FlatList's default `updateCellsBatchingPeriod` (50 ms). */
const FLATLIST_BATCH_MS = 100;

/**
 * Lets FlatLists finish rendering after their data changed. They render new rows in a batch
 * shortly afterwards; without this, that can land after the test ends (an `act` warning).
 */
export const flushListBatches = () =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, FLATLIST_BATCH_MS)));

/** An empty, loaded My List, quiet request logs and empty storage: call in `beforeEach`. */
export async function resetAppState() {
  jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
  jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
  useMyListStore.setState({ entries: [], hydrated: true });
  await AsyncStorage.clear();
}

/**
 * A stand-in platform adapter: `press` sends a key the way a remote or Back button would, and
 * returns the result (`pass` = the platform's default would run, e.g. leaving the app).
 */
export function createTestInput() {
  let send: Dispatch = () => 'pass';
  const setCanGoBack = jest.fn<(canGoBack: boolean) => void>();
  const adapter: InputAdapter = {
    start: (dispatch) => {
      send = dispatch;
      return () => {
        send = () => 'pass';
      };
    },
    setCanGoBack,
  };
  const press = async (key: AppKey): Promise<InputResult> => {
    let result: InputResult = 'pass';
    await act(() => {
      result = send({ key });
    });
    return result;
  };
  return { adapter, press, setCanGoBack };
}

/**
 * The whole app (screens, splash, not-connected cover, exit prompt) with a fresh QueryClient.
 * Returns a test input to press keys with (unless a real `adapter` is passed instead). With
 * `withFocus`, keys reach the focus system as on a TV (arrows move focus, select selects).
 */
export async function renderApp({
  adapter,
  withFocus = false,
}: { adapter?: InputAdapter; withFocus?: boolean } = {}) {
  const { wrapper: QueryWrapper } = createQueryWrapper();
  const input = createTestInput();
  await render(
    <SafeAreaProvider>
      <QueryWrapper>
        <InputProvider
          adapter={adapter ?? input.adapter}
          focusHandler={withFocus ? sendKeyToFocus : undefined}
        >
          <AppContent />
        </InputProvider>
      </QueryWrapper>
    </SafeAreaProvider>,
  );
  return input;
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
