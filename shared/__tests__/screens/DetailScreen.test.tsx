import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { categoryPlaylistUrl } from '../../api/iptv/rails';
import { MY_LIST_FULL_MESSAGE } from '../../hooks/useDetailScreen';
import { MY_LIST_LIMIT, useMyListStore } from '../../state/myListStore';
import { fixture, mockFetch } from '../helpers/mockFetch';
import { appRoutes, metadataRoutes, renderDetail, resetAppState } from '../helpers/renderScreens';

jest.mock('../../ui/Image', () => jest.requireActual<object>('../helpers/mockImage'));
jest.mock('expo-image', () => ({ Image: { prefetch: () => Promise.resolve(true) } }));

beforeEach(resetAppState);

const fullList = (savedIds: string[] = []) => [
  ...savedIds.map((id, i) => ({ id, addedAt: 1000 + i })),
  ...Array.from({ length: MY_LIST_LIMIT - savedIds.length }, (_, i) => ({
    id: `Other${i}.us`,
    addedAt: i,
  })),
];

describe('Detail', () => {
  it('shows the channel straight away, then its facts once metadata has loaded', async () => {
    mockFetch(appRoutes());
    await renderDetail('ABCNewsLive.us');

    expect(await screen.findByRole('header', { name: 'ABC News Live' })).toBeOnTheScreen();
    expect(screen.getByText('ABC News Live is a news channel.')).toBeOnTheScreen();
    expect(screen.getByRole('progressbar', { name: 'Loading channel details' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Play' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Add to My List' })).toBeEnabled();
  });

  it('shows the description and facts from the metadata', async () => {
    mockFetch(appRoutes(metadataRoutes()));
    await renderDetail('ABCNewsLive.us');

    expect(
      await screen.findByText('ABC News Live is a news channel from ABC, on air since 2014.'),
    ).toBeOnTheScreen();
    for (const text of ['United States', 'ABC', '2014', 'News', 'https://abcnews.go.com/Live']) {
      expect(screen.getByText(text)).toBeOnTheScreen();
    }
  });

  it('opens the website in the browser on phones', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    mockFetch(appRoutes(metadataRoutes()));
    await renderDetail('ABCNewsLive.us');

    await fireEvent.press(await screen.findByRole('link', { name: 'https://abcnews.go.com/Live' }));

    expect(openURL).toHaveBeenCalledWith('https://abcnews.go.com/Live');
  });

  it('adds the channel to My List and removes it again', async () => {
    mockFetch(appRoutes());
    await renderDetail('ESPNews.us');

    await fireEvent.press(await screen.findByRole('button', { name: 'Add to My List' }));
    expect(useMyListStore.getState().has('ESPNews.us')).toBe(true);

    await fireEvent.press(screen.getByRole('button', { name: 'Remove from My List' }));
    expect(useMyListStore.getState().has('ESPNews.us')).toBe(false);
    expect(screen.getByRole('button', { name: 'Add to My List' })).toBeOnTheScreen();
  });

  it('says My List is full instead of adding a 51st channel, until there is room', async () => {
    useMyListStore.setState({ entries: fullList() });
    mockFetch(appRoutes());
    await renderDetail('ESPNews.us');

    await fireEvent.press(await screen.findByRole('button', { name: 'Add to My List' }));

    expect(screen.getByText(MY_LIST_FULL_MESSAGE)).toBeOnTheScreen();
    expect(useMyListStore.getState().has('ESPNews.us')).toBe(false);

    await act(() => useMyListStore.getState().remove('Other0.us'));
    expect(screen.queryByText(MY_LIST_FULL_MESSAGE)).not.toBeOnTheScreen();
  });

  it('still removes a saved channel when My List is full', async () => {
    useMyListStore.setState({ entries: fullList(['ESPNews.us']) });
    mockFetch(appRoutes());
    await renderDetail('ESPNews.us');

    await fireEvent.press(await screen.findByRole('button', { name: 'Remove from My List' }));

    expect(useMyListStore.getState().has('ESPNews.us')).toBe(false);
    expect(screen.queryByText(MY_LIST_FULL_MESSAGE)).not.toBeOnTheScreen();
  });

  it('shows a saved channel iptv-org no longer lists as unavailable: no Play, but removable', async () => {
    useMyListStore.setState({ entries: [{ id: 'Gone.us', addedAt: 1 }] });
    mockFetch(appRoutes());
    await renderDetail('Gone.us');

    expect(await screen.findByRole('header', { name: 'Unavailable channel' })).toBeOnTheScreen();
    expect(screen.getByText('This channel is no longer available.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Play' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('button', { name: 'Remove from My List' }));
    expect(useMyListStore.getState().entries).toEqual([]);
  });

  it('shows a loading state while the rails are still loading', async () => {
    mockFetch(
      appRoutes({
        [categoryPlaylistUrl('news')]: { pending: true },
        [categoryPlaylistUrl('sports')]: { pending: true },
        [categoryPlaylistUrl('movies')]: { pending: true },
      }),
    );
    await renderDetail('ESPNews.us');

    expect(screen.getByLabelText('Loading channel')).toBeOnTheScreen();
  });

  it('shows an error with Retry when the channel’s rail failed to load', async () => {
    const routes = appRoutes({ [categoryPlaylistUrl('sports')]: { status: 404 } });
    mockFetch(routes);
    await renderDetail('ESPNews.us');

    expect(await screen.findByText("Couldn't load this channel")).toBeOnTheScreen();

    routes[categoryPlaylistUrl('sports')] = fixture('sports.m3u');
    await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('header', { name: 'ESPNews' })).toBeOnTheScreen();
  });
});
