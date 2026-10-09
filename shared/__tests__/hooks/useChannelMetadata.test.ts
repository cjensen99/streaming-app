import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react-native';
import { CHANNELS_URL } from '../../api/iptv/metadata';
import { usePrefetchChannelMetadata } from '../../hooks/useChannelMetadata';
import { logger } from '../../utils/logger';
import { mockFetch } from '../helpers/mockFetch';
import { createQueryWrapper } from '../helpers/queryWrapper';
import { appRoutes, metadataRoutes } from '../helpers/renderScreens';

beforeEach(() => {
  jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
  // The channels.json fixture includes one invalid entry on purpose, which is logged.
  jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
});

// "Waits until every rail has settled" is covered by the Home screen tests.
describe('usePrefetchChannelMetadata', () => {
  it('downloads the metadata once the rails settle, without re-rendering as it loads', async () => {
    const requests = mockFetch(appRoutes(metadataRoutes()));
    const { client, wrapper } = createQueryWrapper();
    let renders = 0;
    await renderHook(
      () => {
        renders++;
        usePrefetchChannelMetadata();
      },
      { wrapper },
    );
    await waitFor(() => expect(requests(CHANNELS_URL)).toBe(1));
    const rendersWhenStarted = renders;

    // `findAll` matches by key prefix (`find` would need the exact key, which includes a hash).
    const metadataStatus = () =>
      client.getQueryCache().findAll({ queryKey: ['iptv', 'metadata'] })[0]?.state.status;
    await waitFor(() => expect(metadataStatus()).toBe('success'));

    expect(renders).toBe(rendersWhenStarted);
  });
});
