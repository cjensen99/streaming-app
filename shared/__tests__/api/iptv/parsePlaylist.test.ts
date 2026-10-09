import { describe, expect, it } from '@jest/globals';
import { parsePlaylist } from '../../../api/iptv/parsePlaylist';
import { fixture } from '../../helpers/mockFetch';

describe('parsePlaylist', () => {
  const { channels, skipped } = parsePlaylist(fixture('news.m3u'));
  const byName = (name: string) => channels.find((channel) => channel.name === name);

  it('parses id, feed, name, quality, logo and categories', () => {
    expect(channels[0]).toEqual({
      id: 'ABCNewsLive.us',
      feedId: 'SD',
      name: 'ABC News Live',
      logoUrl: 'https://i.imgur.com/abcnewslive.png',
      categories: ['News'],
      quality: '720p',
      labels: [],
      stream: { url: 'https://abc-news.example.com/live/sd/index.m3u8', headers: {} },
    });
  });

  it('splits multiple categories', () => {
    expect(byName('bloomberg TV')?.categories).toEqual(['Business', 'News']);
  });

  it('turns #EXTVLCOPT referrer and user agent into stream headers', () => {
    expect(byName('bloomberg TV')?.stream.headers).toEqual({
      Referer: 'https://www.bloomberg.com/',
      'User-Agent': 'Mozilla/5.0 (Example)',
    });
  });

  it('reads labels and strips them (and the quality) from the name', () => {
    expect(byName('CBS News')).toMatchObject({ quality: '1080p', labels: ['Geo-blocked'] });
    expect(byName('Court TV')?.labels).toEqual(['Not 24/7']);
  });

  it('derives a stable id from the URL when tvg-id is missing', () => {
    const channel = byName('Local News Stream');
    expect(channel?.id).toMatch(/^url-[0-9a-z]+$/);
    expect(channel?.feedId).toBeUndefined();
    expect(channel?.logoUrl).toBeUndefined();
    expect(
      parsePlaylist(fixture('news.m3u')).channels.find((c) => c.name === 'Local News Stream')?.id,
    ).toBe(channel?.id);
  });

  it('skips non-HTTP streams and entries without a URL', () => {
    expect(byName('Novyny.Live')).toBeUndefined(); // rtmp://
    expect(byName('Broken Entry With No URL')).toBeUndefined();
    expect(skipped).toBe(2);
    expect(channels).toHaveLength(9); // 11 entries in the fixture, 2 skipped
  });

  it('keeps commas inside quoted attributes out of the title', () => {
    const { channels: parsed } = parsePlaylist(
      '#EXTINF:-1 tvg-id="X.us@SD" tvg-logo="https://e.com/a,b.png" group-title="News",X, The Channel\nhttps://e.com/x.m3u8',
    );
    expect(parsed[0]).toMatchObject({ name: 'X, The Channel', logoUrl: 'https://e.com/a,b.png' });
  });
});
