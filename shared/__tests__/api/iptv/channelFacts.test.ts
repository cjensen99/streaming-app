import { describe, expect, it } from '@jest/globals';
import { channelFacts } from '../../../api/iptv/channelFacts';
import { channel } from '../../helpers/channels';

describe('channelFacts', () => {
  it('lists the known facts in display order', () => {
    const summary = channel('ABCNewsLive.us', {
      categories: ['News', 'Business'],
      quality: '1080p',
    });
    const metadata = { country: 'United States', network: 'ABC', launched: '2014-07-01' };

    expect(channelFacts(summary, metadata)).toEqual([
      { label: 'Country', value: 'United States' },
      { label: 'Categories', value: 'News, Business' },
      { label: 'Network', value: 'ABC' },
      { label: 'On air since', value: '2014' },
      { label: 'Quality', value: '1080p' },
    ]);
  });

  it('leaves out unknown facts, and before metadata only shows the playlist ones', () => {
    expect(channelFacts(channel('X.us', { categories: [] }))).toEqual([]);
    expect(channelFacts(channel('X.us'), { launched: 'unknown' })).toEqual([
      { label: 'Categories', value: 'news' },
    ]);
  });
});
