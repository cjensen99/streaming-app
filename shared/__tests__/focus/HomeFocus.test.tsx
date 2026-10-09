import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { act, screen, waitFor, within } from '@testing-library/react-native';
import { categoryPlaylistUrl } from '../../api/iptv/rails';
import type { AppKey } from '../../input/keys';
import { useMyListStore } from '../../state/myListStore';
import { fixture, mockFetch } from '../helpers/mockFetch';
import { appRoutes, renderApp, resetAppState } from '../helpers/renderScreens';

jest.mock('../../ui/Image', () => jest.requireActual<object>('../helpers/mockImage'));
jest.mock('expo-image', () => ({ Image: { prefetch: () => Promise.resolve(true) } }));

// Remote-control focus on TVs (this folder only runs in the TV Jest project). Keys go through the
// app's input route into the real focus system, as on a device.

let setConnected: (isConnected: boolean) => void = () => undefined;

beforeEach(async () => {
  await resetAppState();
  jest.mocked(NetInfo.addEventListener).mockImplementation((listener) => {
    setConnected = (isConnected) => listener({ isConnected } as NetInfoState);
    return () => undefined;
  });
});

/**
 * The focused element's label, and the rail it's in (if any). `hidden` also finds elements hidden
 * from screen readers (e.g. under the No internet connection cover).
 */
function focused({ hidden = false } = {}) {
  const options = { selected: true, includeHiddenElements: hidden };
  const element = screen.getByRole('button', options);
  const rail = ['my-list', 'news', 'sports', 'movies'].find((id) => {
    const railElement = screen.queryByTestId(`rail-${id}`, { includeHiddenElements: hidden });
    return railElement && within(railElement).queryByRole('button', options);
  });
  return { label: element.props.accessibilityLabel as string, rail };
}

/** Starts the app with keys going to focus, once focus has landed somewhere. */
async function startApp(routes = appRoutes()) {
  mockFetch(routes);
  const input = await renderApp({ withFocus: true });
  await waitFor(() => expect(screen.getByRole('button', { selected: true })).toBeOnTheScreen());
  const press = async (...keys: AppKey[]) => {
    for (const key of keys) await input.press(key);
  };
  return { ...input, press };
}

describe('Home focus', () => {
  it('starts on the first tile of the first rail with tiles (My List empty → News)', async () => {
    await startApp();

    expect(focused()).toEqual({ label: 'ABC News Live', rail: 'news' });
  });

  it('waits for a rail above to finish loading, rather than starting on a lower one', async () => {
    mockFetch(appRoutes({ [categoryPlaylistUrl('news')]: { pending: true } }));
    await renderApp({ withFocus: true });
    await waitFor(() =>
      expect(within(screen.getByTestId('rail-sports')).getAllByRole('button')).toHaveLength(2),
    );

    // Sports has tiles, but News (above it) is still loading: focus waits for News.
    expect(screen.queryByRole('button', { selected: true })).not.toBeOnTheScreen();
  });

  it('starts on the first My List tile when My List has channels', async () => {
    useMyListStore.setState({ entries: [{ id: 'ESPNews.us', addedAt: 1 }] });
    await startApp();

    expect(focused()).toEqual({ label: 'ESPNews', rail: 'my-list' });
  });

  it('returns to the tile last focused in a rail, or its first tile if never visited', async () => {
    const { press } = await startApp();

    await press('right');
    expect(focused()).toEqual({ label: 'bloomberg TV', rail: 'news' });

    await press('down');
    expect(focused()).toEqual({ label: 'ABC News Live', rail: 'sports' }); // first visit

    await press('right', 'up');
    expect(focused()).toEqual({ label: 'bloomberg TV', rail: 'news' }); // remembered

    await press('down');
    expect(focused()).toEqual({ label: 'ESPNews', rail: 'sports' }); // remembered
  });

  it('skips rails that are loading or empty', async () => {
    const { press } = await startApp(
      appRoutes({
        [categoryPlaylistUrl('sports')]: { pending: true },
        [categoryPlaylistUrl('movies')]: fixture('news.m3u'),
      }),
    );

    await press('down');
    expect(focused().rail).toBe('movies'); // past the loading Sports rail

    await press('down');
    expect(focused().rail).toBe('movies'); // nothing below
  });

  it('can focus a failed rail’s Retry, and selecting it reloads the rail', async () => {
    const routes = appRoutes({ [categoryPlaylistUrl('sports')]: { status: 404 } });
    const { press } = await startApp(routes);

    await press('down');
    expect(focused().label).toBe('Retry Sports');

    routes[categoryPlaylistUrl('sports')] = fixture('sports.m3u');
    await press('select');
    await waitFor(() =>
      expect(within(screen.getByTestId('rail-sports')).getAllByRole('button')).toHaveLength(2),
    );
  });

  it('opens Detail with Play focused, and Back returns to the tile that was opened', async () => {
    const { press } = await startApp();
    await press('right', 'select');

    expect(await screen.findByRole('header', { name: 'bloomberg TV' })).toBeOnTheScreen();
    expect(focused().label).toBe('Play');

    await press('back');
    await waitFor(() => expect(focused()).toEqual({ label: 'bloomberg TV', rail: 'news' }));
  });

  it('focuses Remove from My List for an unavailable channel (Play is disabled)', async () => {
    useMyListStore.setState({ entries: [{ id: 'Gone.us', addedAt: 1 }] });
    const { press } = await startApp();
    expect(focused()).toEqual({ label: 'Unavailable channel', rail: 'my-list' });

    await press('select');

    await waitFor(() => expect(focused().label).toBe('Remove from My List'));
  });

  it('after removing a My List channel on Detail, Back focuses the start of My List', async () => {
    useMyListStore.setState({
      entries: [
        { id: 'ESPNews.us', addedAt: 2 },
        { id: 'BloombergTV.us', addedAt: 1 },
      ],
    });
    const { press } = await startApp();
    await press('right'); // bloomberg TV, second in My List
    await press('select');
    await waitFor(() => expect(focused().label).toBe('Play'));

    await press('right', 'select'); // Remove from My List
    expect(useMyListStore.getState().has('BloombergTV.us')).toBe(false);
    await press('back');

    await waitFor(() => expect(focused()).toEqual({ label: 'ESPNews', rail: 'my-list' }));
  });

  it('…even when the removed channel was in the middle of My List', async () => {
    useMyListStore.setState({
      entries: [
        { id: 'ESPNews.us', addedAt: 3 },
        { id: 'BloombergTV.us', addedAt: 2 },
        { id: 'ABCNewsLive.us', addedAt: 1 },
      ],
    });
    const { press } = await startApp();
    await press('right'); // bloomberg TV, the middle one
    await press('select');
    await waitFor(() => expect(focused().label).toBe('Play'));

    await press('right', 'select', 'back');

    // Not ABC News Live, which moved into the removed channel's position.
    await waitFor(() => expect(focused()).toEqual({ label: 'ESPNews', rail: 'my-list' }));
  });

  it('…or the next rail with tiles when My List is now empty', async () => {
    useMyListStore.setState({ entries: [{ id: 'ESPNews.us', addedAt: 1 }] });
    const { press } = await startApp();
    await press('select');
    await waitFor(() => expect(focused().label).toBe('Play'));

    await press('right', 'select', 'back');

    await waitFor(() => expect(focused()).toEqual({ label: 'ABC News Live', rail: 'news' }));
  });

  it('takes no keys while the No internet connection cover is up', async () => {
    const { press } = await startApp();

    await act(() => setConnected(false));
    await press('right');
    expect(focused({ hidden: true })).toEqual({ label: 'ABC News Live', rail: 'news' });

    await act(() => setConnected(true));
    await press('right');
    expect(focused()).toEqual({ label: 'bloomberg TV', rail: 'news' });
  });

  it('focuses Retry on the full-screen error when every rail failed', async () => {
    mockFetch(
      appRoutes({
        [categoryPlaylistUrl('news')]: { status: 404 },
        [categoryPlaylistUrl('sports')]: { status: 404 },
        [categoryPlaylistUrl('movies')]: { status: 404 },
      }),
    );
    await renderApp({ withFocus: true });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Retry', selected: true })).toBeOnTheScreen(),
    );
  });
});
