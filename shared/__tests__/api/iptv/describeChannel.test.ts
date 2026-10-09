import { describe, expect, it } from '@jest/globals';
import { describeChannel } from '../../../api/iptv/describeChannel';
import type { ChannelSummary } from '../../../types/content';

const channel = (name: string, categories: string[]): ChannelSummary => ({
  id: 'X.us',
  name,
  categories,
  labels: [],
  stream: { url: 'https://e.com/x.m3u8', headers: {} },
});

describe('describeChannel', () => {
  it('uses categories, network and launch year when known', () => {
    expect(
      describeChannel(channel('ABC News Live', ['News']), {
        network: 'ABC',
        launched: '2014-07-01',
      }),
    ).toBe('ABC News Live is a news channel from ABC, on air since 2014.');
  });

  it('joins several categories and picks "an" before a vowel', () => {
    expect(describeChannel(channel('E!', ['Entertainment', 'Lifestyle', 'News']))).toBe(
      'E! is an entertainment, lifestyle and news channel.',
    );
  });

  it('falls back to a plain sentence without categories or metadata', () => {
    expect(describeChannel(channel('Some Channel', []))).toBe('Some Channel is a live TV channel.');
  });

  it('ignores a malformed launch date', () => {
    expect(describeChannel(channel('X', ['News']), { launched: 'unknown' })).toBe(
      'X is a news channel.',
    );
  });
});
