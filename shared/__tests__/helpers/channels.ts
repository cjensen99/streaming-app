import type { ChannelSummary, TileItem } from '../../types/content';

/** A channel for component tests. */
export const channel = (id: string, overrides: Partial<ChannelSummary> = {}): ChannelSummary => ({
  id,
  name: id.replace(/\.us$/, ''),
  logoUrl: `https://example.com/${id}.png`,
  categories: ['news'],
  labels: [],
  stream: { url: `https://example.com/${id}.m3u8`, headers: {} },
  ...overrides,
});

/** An available tile for a channel. */
export const tile = (id: string, overrides: Partial<ChannelSummary> = {}): TileItem => ({
  status: 'available',
  id,
  channel: channel(id, overrides),
});
