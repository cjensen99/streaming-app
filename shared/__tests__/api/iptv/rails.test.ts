import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { parsePlaylist } from '../../../api/iptv/parsePlaylist';
import {
  buildRail,
  feedKey,
  MAX_RAIL_LENGTH,
  RAIL_CONFIG,
  type RailConfig,
} from '../../../api/iptv/rails';
import { logger } from '../../../utils/logger';
import { fixture } from '../../helpers/mockFetch';

const news = RAIL_CONFIG[0] as RailConfig;
const englishFeeds = new Set(parsePlaylist(fixture('eng.m3u')).channels.map(feedKey));

beforeEach(() => {
  jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
});

describe('RAIL_CONFIG', () => {
  it('is News, Sports, Movies, in that order', () => {
    expect(RAIL_CONFIG.map((rail) => rail.title)).toEqual(['News', 'Sports', 'Movies']);
  });
});

describe('buildRail', () => {
  const buildNews = () => buildRail(news, fixture('news.m3u'), englishFeeds);

  it('keeps only US + English channels that reliably play, alphabetically', () => {
    const rail = buildNews();
    const names = rail.items.map((channel) => channel.name);
    expect(rail).toMatchObject({ id: 'news', title: 'News' });
    // Excluded: 2GB (.au), Al Jazeera English (.qa), Noticias Telemundo (not English),
    // CBS News (geo-blocked), Court TV (not 24/7), Local News Stream (no .us id).
    expect(names).toEqual(['ABC News Live', 'bloomberg TV']);
  });

  it('keeps one entry per channel (the first feed)', () => {
    const abc = buildNews().items.filter((channel) => channel.id === 'ABCNewsLive.us');
    expect(abc).toHaveLength(1);
    expect(abc[0]?.feedId).toBe('SD');
  });

  it(`caps a rail at ${MAX_RAIL_LENGTH} channels`, () => {
    const entries = Array.from({ length: MAX_RAIL_LENGTH + 50 }, (_, i) => {
      const id = `Channel${String(i).padStart(3, '0')}.us@SD`;
      return `#EXTINF:-1 tvg-id="${id}" group-title="News",Channel ${i}\nhttps://e.com/${i}.m3u8`;
    });
    const allEnglish = new Set(entries.map((_, i) => `Channel${String(i).padStart(3, '0')}.us@SD`));

    expect(buildRail(news, entries.join('\n'), allEnglish).items).toHaveLength(MAX_RAIL_LENGTH);
  });
});
