import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { onlineManager } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { categoryPlaylistUrl, ENGLISH_PLAYLIST_URL } from '../../api/iptv/rails';
import { useHomeRails } from '../../hooks/useHomeRails';
import { logger } from '../../utils/logger';
import { fixture, mockFetch } from '../helpers/mockFetch';
import { createQueryWrapper } from '../helpers/queryWrapper';

const EMPTY_PLAYLIST = '#EXTM3U\n';

beforeEach(() => {
  jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
  jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
});
afterEach(() => {
  onlineManager.setOnline(true);
});

const allRoutes = () => ({
  [ENGLISH_PLAYLIST_URL]: fixture('eng.m3u'),
  [categoryPlaylistUrl('news')]: fixture('news.m3u'),
  [categoryPlaylistUrl('sports')]: fixture('sports.m3u'),
  [categoryPlaylistUrl('movies')]: EMPTY_PLAYLIST,
});

describe('useHomeRails', () => {
  it('loads the three rails, downloading the English list only once', async () => {
    const requests = mockFetch({
      [ENGLISH_PLAYLIST_URL]: fixture('eng.m3u'),
      [categoryPlaylistUrl('news')]: fixture('news.m3u'),
      [categoryPlaylistUrl('sports')]: fixture('sports.m3u'),
      [categoryPlaylistUrl('movies')]: EMPTY_PLAYLIST,
    });
    const { wrapper } = createQueryWrapper();

    const { result } = await renderHook(() => useHomeRails(), { wrapper });
    expect(result.current.map((rail) => rail.isLoading)).toEqual([true, true, true]);

    await waitFor(() => expect(result.current.every((rail) => !rail.isLoading)).toBe(true));
    const [news, sports, movies] = result.current;
    expect(news?.rail?.items.map((c) => c.name)).toEqual(['ABC News Live', 'bloomberg TV']);
    expect(sports?.rail?.items.map((c) => c.name)).toEqual(['ABC News Live', 'ESPNews']);
    expect(movies?.rail?.items).toEqual([]);
    expect(requests(ENGLISH_PLAYLIST_URL)).toBe(1);
  });

  it('shows the other rails when one fails, and can retry the failed one', async () => {
    const routes: Parameters<typeof mockFetch>[0] = {
      [ENGLISH_PLAYLIST_URL]: fixture('eng.m3u'),
      [categoryPlaylistUrl('news')]: fixture('news.m3u'),
      [categoryPlaylistUrl('sports')]: { status: 404 },
      [categoryPlaylistUrl('movies')]: EMPTY_PLAYLIST,
    };
    mockFetch(routes);
    const { wrapper } = createQueryWrapper();

    const { result } = await renderHook(() => useHomeRails(), { wrapper });
    await waitFor(() => expect(result.current.every((rail) => !rail.isLoading)).toBe(true));

    const [news, sports] = result.current;
    expect(news?.rail?.items).toHaveLength(2);
    expect(sports?.error?.kind).toBe('notFound');

    routes[categoryPlaylistUrl('sports')] = fixture('sports.m3u');
    await act(() => result.current[1]?.retry());
    await waitFor(() => expect(result.current[1]?.rail?.items).toHaveLength(2));
    expect(result.current[1]?.error).toBeNull();
  });

  it('shows a retried rail as loading (not as its old error) until it finishes', async () => {
    const routes: Parameters<typeof mockFetch>[0] = {
      ...allRoutes(),
      [categoryPlaylistUrl('sports')]: { status: 404 },
    };
    mockFetch(routes);
    const { wrapper } = createQueryWrapper();
    const { result } = await renderHook(() => useHomeRails(), { wrapper });
    await waitFor(() => expect(result.current[1]?.error?.kind).toBe('notFound'));

    routes[categoryPlaylistUrl('sports')] = { pending: true };
    await act(() => result.current[1]?.retry());

    await waitFor(() => expect(result.current[1]).toMatchObject({ isLoading: true, error: null }));
  });

  it('retries failed rails when the connection comes back, but not loaded ones', async () => {
    const routes: Parameters<typeof mockFetch>[0] = {
      ...allRoutes(),
      [categoryPlaylistUrl('sports')]: { status: 404 },
    };
    const requests = mockFetch(routes);
    const { wrapper } = createQueryWrapper();
    const { result } = await renderHook(() => useHomeRails(), { wrapper });
    await waitFor(() => expect(result.current[1]?.error?.kind).toBe('notFound'));

    routes[categoryPlaylistUrl('sports')] = fixture('sports.m3u');
    await act(() => onlineManager.setOnline(false));
    await act(() => onlineManager.setOnline(true));

    await waitFor(() => expect(result.current[1]?.rail?.items).toHaveLength(2));
    expect(requests(categoryPlaylistUrl('sports'))).toBe(2);
    expect(requests(categoryPlaylistUrl('news'))).toBe(1);
  });

  it('downloads once per launch: coming back to Home makes no new requests', async () => {
    const requests = mockFetch(allRoutes());
    const { wrapper } = createQueryWrapper();
    const first = await renderHook(() => useHomeRails(), { wrapper });
    await waitFor(() => expect(first.result.current.every((rail) => !rail.isLoading)).toBe(true));
    await first.unmount();

    const again = await renderHook(() => useHomeRails(), { wrapper });

    expect(again.result.current[0]?.rail?.items).toHaveLength(2);
    expect(requests(categoryPlaylistUrl('news'))).toBe(1);
    expect(requests(ENGLISH_PLAYLIST_URL)).toBe(1);
  });

  it('waits while offline, then loads by itself when a connection appears', async () => {
    onlineManager.setOnline(false);
    const requests = mockFetch(allRoutes());
    const { wrapper } = createQueryWrapper();

    const { result } = await renderHook(() => useHomeRails(), { wrapper });
    expect(result.current.every((rail) => rail.isLoading && !rail.error)).toBe(true);
    expect(requests(categoryPlaylistUrl('news'))).toBe(0);

    await act(() => onlineManager.setOnline(true));
    await waitFor(() => expect(result.current[0]?.rail?.items).toHaveLength(2));
  });

  it('returns the same objects until a rail actually changes, so memoised UI skips re-renders', async () => {
    mockFetch(allRoutes());
    const { wrapper } = createQueryWrapper();
    const { result, rerender } = await renderHook(() => useHomeRails(), { wrapper });
    await waitFor(() => expect(result.current.every((rail) => !rail.isLoading)).toBe(true));
    const before = result.current;

    await rerender({});

    expect(result.current).toBe(before);
    expect(result.current[0]).toBe(before[0]);
  });
});
