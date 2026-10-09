import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import { CHANNELS_URL } from '../../api/iptv/metadata';
import { categoryPlaylistUrl } from '../../api/iptv/rails';
import { useMyListStore } from '../../state/myListStore';
import { isPhoneBuild } from '../helpers/formFactor';
import { imageRenders } from '../helpers/mockImage';
import { fixture, mockFetch } from '../helpers/mockFetch';
import { appRoutes, flushListBatches, renderApp, resetAppState } from '../helpers/renderScreens';

jest.mock('../../ui/Image', () => jest.requireActual<object>('../helpers/mockImage'));
const mockPrefetch = jest.fn((_urls: string[]) => Promise.resolve(true));
jest.mock('expo-image', () => ({ Image: { prefetch: (urls: string[]) => mockPrefetch(urls) } }));

beforeEach(async () => {
  imageRenders.mockClear();
  mockPrefetch.mockClear();
  await resetAppState();
});

/** The titles of the tiles in one rail, in order. */
const tilesIn = (railTestId: string) =>
  within(screen.getByTestId(railTestId))
    .queryAllByRole('button')
    .map((tile) => tile.props.accessibilityLabel as string);

const allRailsLoaded = () =>
  waitFor(() =>
    expect(screen.queryAllByTestId('rail-spinner', { includeHiddenElements: true })).toHaveLength(
      0,
    ),
  );

describe('Home', () => {
  it('shows a spinner in each category rail while its channels load', async () => {
    mockFetch(
      appRoutes({
        [categoryPlaylistUrl('news')]: { pending: true },
        [categoryPlaylistUrl('sports')]: { pending: true },
        [categoryPlaylistUrl('movies')]: { pending: true },
      }),
    );
    await renderApp();

    expect(screen.getByRole('header', { name: 'StreamShelf' })).toBeOnTheScreen();
    expect(screen.getAllByTestId('rail-spinner', { includeHiddenElements: true })).toHaveLength(3);
    for (const title of ['News', 'Sports', 'Movies']) {
      expect(screen.getByRole('progressbar', { name: `Loading ${title}` })).toBeOnTheScreen();
    }
  });

  it('shows My List, then the News, Sports and Movies rails with their channels', async () => {
    mockFetch(appRoutes());
    await renderApp();
    await allRailsLoaded();

    expect(screen.getAllByRole('header').map((h) => h.props.children as string)).toEqual([
      'StreamShelf',
      'My List',
      'News',
      'Sports',
      'Movies',
    ]);
    expect(tilesIn('rail-news')).toEqual(['ABC News Live', 'bloomberg TV']);
    expect(tilesIn('rail-sports')).toEqual(['ABC News Live', 'ESPNews']);
    expect(
      within(screen.getByTestId('rail-my-list')).getByText('No channels in My List yet'),
    ).toBeOnTheScreen();
    expect(
      within(screen.getByTestId('rail-movies')).getByText('No channels right now'),
    ).toBeOnTheScreen();
  });

  it('shows saved channels first in the My List rail, newest first', async () => {
    useMyListStore.setState({
      entries: [
        { id: 'ESPNews.us', addedAt: 2 },
        { id: 'BloombergTV.us', addedAt: 1 },
      ],
    });
    mockFetch(appRoutes());
    await renderApp();
    await allRailsLoaded();

    expect(tilesIn('rail-my-list')).toEqual(['ESPNews', 'bloomberg TV']);
    await flushListBatches(); // its items changed as the rails loaded
  });

  it('renders only the new tile when a channel is added to My List (phones)', async () => {
    useMyListStore.setState({
      entries: [
        { id: 'ESPNews.us', addedAt: 2 },
        { id: 'ABCNewsLive.us', addedAt: 1 },
      ],
    });
    mockFetch(appRoutes());
    await renderApp();
    await allRailsLoaded();
    imageRenders.mockClear();

    await act(() => useMyListStore.getState().add('BloombergTV.us'));
    await flushListBatches();

    if (isPhoneBuild) {
      expect(imageRenders.mock.calls).toEqual([['https://i.imgur.com/bloomberg.png']]);
    } else {
      // TVs: the focus system's list renders tiles by position, so adding a channel at the front
      // shifts (and re-renders) each visible tile once. Nothing renders twice.
      const uris = imageRenders.mock.calls.map(([uri]) => uri);
      expect(uris).toContain('https://i.imgur.com/bloomberg.png');
      expect(new Set(uris).size).toBe(uris.length);
    }
  });

  it('shows the other rails when one fails, and Retry reloads it', async () => {
    const routes = appRoutes({ [categoryPlaylistUrl('sports')]: { status: 404 } });
    mockFetch(routes);
    await renderApp();
    await waitFor(() => expect(screen.getByText("Couldn't load Sports.")).toBeOnTheScreen());

    expect(tilesIn('rail-news')).toEqual(['ABC News Live', 'bloomberg TV']);

    routes[categoryPlaylistUrl('sports')] = fixture('sports.m3u');
    await fireEvent.press(screen.getByRole('button', { name: 'Retry Sports' }));
    await waitFor(() => expect(tilesIn('rail-sports')).toEqual(['ABC News Live', 'ESPNews']));
  });

  it('shows one full-screen error when every rail fails, and Retry reloads them all', async () => {
    const routes = appRoutes({
      [categoryPlaylistUrl('news')]: { status: 404 },
      [categoryPlaylistUrl('sports')]: { status: 404 },
      [categoryPlaylistUrl('movies')]: { status: 404 },
    });
    mockFetch(routes);
    await renderApp();
    await waitFor(() => expect(screen.getByText("Couldn't load channels")).toBeOnTheScreen());
    expect(screen.queryByText('My List')).not.toBeOnTheScreen();

    Object.assign(routes, appRoutes());
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(tilesIn('rail-news')).toEqual(['ABC News Live', 'bloomberg TV']));
  });

  it('downloads the channel metadata in the background once the rails have loaded', async () => {
    const requests = mockFetch(appRoutes());
    await renderApp();
    await allRailsLoaded();

    await waitFor(() => expect(requests(CHANNELS_URL)).toBe(1));
  });

  it('waits for every rail before downloading metadata, so it downloads only once', async () => {
    const requests = mockFetch(appRoutes({ [categoryPlaylistUrl('movies')]: { pending: true } }));
    await renderApp();
    await waitFor(() => expect(tilesIn('rail-sports')).toEqual(['ABC News Live', 'ESPNews']));

    expect(requests(CHANNELS_URL)).toBe(0);
  });

  it('fetches the first rail’s logos ahead', async () => {
    mockFetch(appRoutes());
    await renderApp();

    await waitFor(() =>
      expect(mockPrefetch).toHaveBeenCalledWith([
        'https://i.imgur.com/abcnewslive.png',
        'https://i.imgur.com/bloomberg.png',
      ]),
    );
  });

  it('opens a channel, adds it to My List, and Home shows it first in the My List rail', async () => {
    mockFetch(appRoutes());
    await renderApp();
    await allRailsLoaded();

    await fireEvent.press(
      within(screen.getByTestId('rail-sports')).getByRole('button', { name: 'ESPNews' }),
    );
    await fireEvent.press(await screen.findByRole('button', { name: 'Add to My List' }));
    expect(screen.getByRole('button', { name: 'Remove from My List' })).toBeOnTheScreen();

    // Home stays mounted under Detail; its My List rail already shows the channel.
    const myListRail = screen.getByTestId('rail-my-list', { includeHiddenElements: true });
    expect(
      within(myListRail).getByRole('button', { name: 'ESPNews', includeHiddenElements: true }),
    ).toBeTruthy();
  });
});
