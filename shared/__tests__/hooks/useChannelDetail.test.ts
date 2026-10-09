import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { CHANNELS_URL, COUNTRIES_URL } from '../../api/iptv/metadata';
import { categoryPlaylistUrl, ENGLISH_PLAYLIST_URL } from '../../api/iptv/rails';
import { useChannelDetail } from '../../hooks/useChannelDetail';
import { logger } from '../../utils/logger';
import { fixture, mockFetch, requestUrl } from '../helpers/mockFetch';
import { createQueryWrapper } from '../helpers/queryWrapper';

jest.mock('expo-image', () => ({ Image: { prefetch: jest.fn(() => Promise.resolve(true)) } }));

beforeEach(() => {
  jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
  jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
});

/**
 * Answers from fixtures. Held-back responses stay pending until released, or rejected when the
 * request is cancelled (as React Query does on unmount), so no request outlives its test.
 */
function mockNetwork({ holdRails = false, holdMetadata = false } = {}) {
  let release: () => void = () => undefined;
  const released = new Promise<void>((resolve) => (release = resolve));
  const routes: Record<string, { body: string; hold: boolean }> = {
    [ENGLISH_PLAYLIST_URL]: { body: fixture('eng.m3u'), hold: holdRails },
    [categoryPlaylistUrl('news')]: { body: fixture('news.m3u'), hold: holdRails },
    [categoryPlaylistUrl('sports')]: { body: fixture('sports.m3u'), hold: holdRails },
    [categoryPlaylistUrl('movies')]: { body: '#EXTM3U\n', hold: holdRails },
    [CHANNELS_URL]: { body: fixture('channels.json'), hold: holdMetadata },
    [COUNTRIES_URL]: { body: fixture('countries.json'), hold: holdMetadata },
  };
  const failing = new Set<string>();
  jest.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
    const url = requestUrl(input);
    if (failing.has(url)) return Promise.resolve(new Response('', { status: 404 }));
    const route = routes[url];
    if (!route) return Promise.reject(new Error(`Unexpected request: ${url}`));
    if (!route.hold) return Promise.resolve(new Response(route.body));
    return new Promise<Response>((resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      void released.then(() => resolve(new Response(route.body)));
    });
  });
  return { release, failRail: (url: string) => failing.add(url) };
}

describe('useChannelDetail', () => {
  it('shows the channel as soon as the rails load, then adds metadata', async () => {
    const { release } = mockNetwork({ holdMetadata: true });
    const { wrapper } = createQueryWrapper();

    const { result } = await renderHook(() => useChannelDetail('ABCNewsLive.us'), { wrapper });

    await waitFor(() => expect(result.current.detail).toBeDefined());
    expect(result.current.detail?.summary.name).toBe('ABC News Live');
    expect(result.current.detail?.metadata).toBeUndefined();
    expect(result.current.detail?.description).toBe('ABC News Live is a news channel.');
    expect(result.current.isMetadataLoading).toBe(true);

    release();
    await waitFor(() => expect(result.current.detail?.metadata?.network).toBe('ABC'));
    expect(result.current.detail?.description).toBe(
      'ABC News Live is a news channel from ABC, on air since 2014.',
    );
    expect(result.current.isMetadataLoading).toBe(false);
  });

  it('reports a channel that no loaded rail contains as unavailable', async () => {
    mockNetwork();
    const { wrapper } = createQueryWrapper();

    const { result } = await renderHook(() => useChannelDetail('Unknown.us'), { wrapper });

    await waitFor(() => expect(result.current.isUnavailable).toBe(true));
    expect(result.current).toMatchObject({ detail: undefined, isLoading: false, error: null });
  });

  it('reports an error (not unavailable) when a rail failed, and retries the failed rail', async () => {
    const { failRail } = mockNetwork();
    failRail(categoryPlaylistUrl('movies'));
    const { wrapper } = createQueryWrapper();

    const { result } = await renderHook(() => useChannelDetail('SomeMovie.us'), { wrapper });

    await waitFor(() => expect(result.current.error?.kind).toBe('notFound'));
    expect(result.current.isUnavailable).toBe(false);

    const requestsBefore = jest.mocked(globalThis.fetch).mock.calls.length;
    await act(() => result.current.retry());
    await waitFor(() =>
      expect(jest.mocked(globalThis.fetch).mock.calls.length).toBeGreaterThan(requestsBefore),
    );
  });

  it('reports loading, not unavailable, while the rails are still loading', async () => {
    mockNetwork({ holdRails: true });
    const { wrapper } = createQueryWrapper();

    const { result } = await renderHook(() => useChannelDetail('ABCNewsLive.us'), { wrapper });

    expect(result.current).toMatchObject({ isLoading: true, isUnavailable: false, error: null });
  });
});

describe('mockFetch helper', () => {
  it('fails unexpected requests', async () => {
    mockFetch({});
    await expect(fetch('https://unexpected.example.com')).rejects.toThrow('Unexpected request');
  });
});
