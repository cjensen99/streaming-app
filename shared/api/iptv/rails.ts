import type { ChannelSummary, Rail } from '../../types/content';
import { logger } from '../../utils/logger';
import { fetchText, type RequestOptions } from '../client';
import { parsePlaylist } from './parsePlaylist';

/**
 * The three category rails under My List on Home, and the rules that pick their channels:
 * US + English only, no geo-blocked or part-time streams, one entry per channel, alphabetical,
 * at most 200. iptv-org has no server-side filtering, so whole playlists are downloaded and
 * filtered here (see PLAN → Data sources).
 */

export const RAIL_CONFIG = [
  { id: 'news', title: 'News' },
  { id: 'sports', title: 'Sports' },
  { id: 'movies', title: 'Movies' },
] as const;

export type RailConfig = (typeof RAIL_CONFIG)[number];
export type RailId = RailConfig['id'];

/** A safety limit; with the US + English filter, rails hold well under this. */
export const MAX_RAIL_LENGTH = 200;

const PLAYLISTS_URL = 'https://iptv-org.github.io/iptv';
export const ENGLISH_PLAYLIST_URL = `${PLAYLISTS_URL}/languages/eng.m3u`;
export const categoryPlaylistUrl = (id: RailId) => `${PLAYLISTS_URL}/categories/${id}.m3u`;

/** Playlist labels for streams that often won't play. */
const EXCLUDED_LABELS = new Set(['Geo-blocked', 'Not 24/7']);

/** Identifies a channel's feed (`CNN.us@SD`); language is per feed, not per channel. */
export const feedKey = (channel: ChannelSummary) =>
  channel.feedId ? `${channel.id}@${channel.feedId}` : channel.id;

const isUsChannel = (channel: ChannelSummary) => channel.id.toLowerCase().endsWith('.us');

/** The feed keys in iptv-org's English playlist, used to keep only English channels. */
export async function fetchEnglishFeedKeys(options?: RequestOptions): Promise<string[]> {
  const { channels } = parsePlaylist(await fetchText(ENGLISH_PLAYLIST_URL, options));
  return channels.map(feedKey);
}

/** Pure: turns a category playlist into a rail using the rules above. */
export function buildRail(
  config: RailConfig,
  playlist: string,
  englishFeedKeys: ReadonlySet<string>,
): Rail {
  const { channels, skipped } = parsePlaylist(playlist);
  if (skipped > 0) logger.debug(`${config.id} playlist: skipped ${skipped} malformed entries`);

  const seen = new Set<string>();
  const items = channels.filter((channel) => {
    if (!isUsChannel(channel) || !englishFeedKeys.has(feedKey(channel))) return false;
    if (channel.labels.some((label) => EXCLUDED_LABELS.has(label))) return false;
    if (seen.has(channel.id)) return false; // another stream/feed of a channel already kept
    seen.add(channel.id);
    return true;
  });
  items.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

  return { id: config.id, title: config.title, items: items.slice(0, MAX_RAIL_LENGTH) };
}

export async function fetchRail(
  config: RailConfig,
  englishFeedKeys: ReadonlySet<string>,
  options?: RequestOptions,
): Promise<Rail> {
  return buildRail(
    config,
    await fetchText(categoryPlaylistUrl(config.id), options),
    englishFeedKeys,
  );
}
