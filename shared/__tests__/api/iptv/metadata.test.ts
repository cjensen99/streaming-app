import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CHANNELS_URL, COUNTRIES_URL, fetchChannelMetadata } from '../../../api/iptv/metadata';
import { logger } from '../../../utils/logger';
import { fixture, mockFetch } from '../../helpers/mockFetch';

beforeEach(() => {
  jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
  jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
});

describe('fetchChannelMetadata', () => {
  it('returns slim metadata for the requested channels only, with country names', async () => {
    mockFetch({
      [CHANNELS_URL]: fixture('channels.json'),
      [COUNTRIES_URL]: fixture('countries.json'),
    });

    const metadata = await fetchChannelMetadata(['ABCNewsLive.us', 'BloombergTV.us', 'Unknown.us']);

    expect(metadata).toEqual({
      'ABCNewsLive.us': {
        country: 'United States',
        network: 'ABC',
        launched: '2014-07-01',
        website: 'https://abcnews.go.com/Live',
      },
      // Null fields are left out rather than stored.
      'BloombergTV.us': { country: 'United States' },
    });
  });

  it('skips entries that fail validation instead of failing the whole file', async () => {
    mockFetch({
      [CHANNELS_URL]: fixture('channels.json'),
      [COUNTRIES_URL]: fixture('countries.json'),
    });

    await fetchChannelMetadata(['ABCNewsLive.us']);

    expect(logger.warn).toHaveBeenCalledWith(
      'channels.json: skipped 1 entries that failed validation',
    );
  });

  it('fails with a parse error when the file is not a list', async () => {
    mockFetch({ [CHANNELS_URL]: '{"error":"oops"}', [COUNTRIES_URL]: fixture('countries.json') });

    await expect(fetchChannelMetadata(['ABCNewsLive.us'])).rejects.toMatchObject({
      kind: 'parse',
    });
  });
});
