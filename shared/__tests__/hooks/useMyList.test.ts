import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { categoryPlaylistUrl, ENGLISH_PLAYLIST_URL } from '../../api/iptv/rails';
import { useMyList } from '../../hooks/useMyList';
import { useMyListStore } from '../../state/myListStore';
import { logger } from '../../utils/logger';
import { fixture, type MockRoute, mockFetch } from '../helpers/mockFetch';
import { createQueryWrapper } from '../helpers/queryWrapper';

jest.mock('expo-image', () => ({ Image: { prefetch: () => Promise.resolve(true) } }));

beforeEach(async () => {
  jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
  jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
  useMyListStore.setState({
    hydrated: true,
    entries: [
      { id: 'Gone.us', addedAt: 3 }, // no longer in any playlist
      { id: 'ESPNews.us', addedAt: 2 }, // in the Sports rail
      { id: 'ABCNewsLive.us', addedAt: 1 }, // in the News (and Sports) rail
    ],
  });
  await AsyncStorage.clear();
});

const routes = (movies: MockRoute = '#EXTM3U\n') => ({
  [ENGLISH_PLAYLIST_URL]: fixture('eng.m3u'),
  [categoryPlaylistUrl('news')]: fixture('news.m3u'),
  [categoryPlaylistUrl('sports')]: fixture('sports.m3u'),
  [categoryPlaylistUrl('movies')]: movies,
});

describe('useMyList', () => {
  it('resolves saved ids against the rails, newest first', async () => {
    mockFetch(routes());
    const { wrapper } = createQueryWrapper();

    const { result } = await renderHook(() => useMyList(), { wrapper });
    await waitFor(() =>
      expect(result.current.items.every((item) => item.status !== 'pending')).toBe(true),
    );

    expect(result.current.items.map(({ id, status }) => [id, status])).toEqual([
      ['Gone.us', 'unavailable'],
      ['ESPNews.us', 'available'],
      ['ABCNewsLive.us', 'available'],
    ]);
    const espn = result.current.items[1];
    expect(espn?.status === 'available' && espn.channel.name).toBe('ESPNews');
  });

  it('keeps unresolved channels pending (not unavailable) while a rail has failed', async () => {
    mockFetch(routes({ status: 404 }));
    const { wrapper } = createQueryWrapper();

    const { result } = await renderHook(() => useMyList(), { wrapper });
    await waitFor(() => expect(result.current.items[1]?.status).toBe('available'));

    expect(result.current.items[0]?.status).toBe('pending');
  });

  it('reports loading until the saved list has been read from storage', async () => {
    mockFetch(routes());
    useMyListStore.setState({ hydrated: false });
    const { wrapper } = createQueryWrapper();

    const { result } = await renderHook(() => useMyList(), { wrapper });
    expect(result.current.isLoading).toBe(true);

    // Still loading once the rails have arrived: only reading the saved list ends it. (Waiting
    // also lets the downloads finish inside the test, so no update lands after it.)
    await waitFor(() =>
      expect(result.current.items.every((item) => item.status !== 'pending')).toBe(true),
    );
    expect(result.current.isLoading).toBe(true);
  });

  it('returns the same object until something changes', async () => {
    mockFetch(routes());
    const { wrapper } = createQueryWrapper();
    const { result, rerender } = await renderHook(() => useMyList(), { wrapper });
    await waitFor(() =>
      expect(result.current.items.every((item) => item.status !== 'pending')).toBe(true),
    );
    const before = result.current;

    await rerender({});
    expect(result.current).toBe(before);

    await act(() => {
      useMyListStore.getState().remove('Gone.us');
    });
    expect(result.current).not.toBe(before);
    expect(result.current.items).toHaveLength(2);
  });
});
