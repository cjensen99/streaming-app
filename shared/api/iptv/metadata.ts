import { z } from 'zod';
import type { ChannelMetadata } from '../../types/content';
import { logger } from '../../utils/logger';
import { ApiError, fetchJson, type RequestOptions } from '../client';

/**
 * Detail-screen metadata from iptv-org's JSON API. `channels.json` describes ~30,000 channels
 * (7.9 MB, ~1 MB gzipped), so only the requested channels are kept in memory. Entries are
 * validated one at a time, so a single malformed entry is skipped instead of failing the whole
 * file.
 */

const API_URL = 'https://iptv-org.github.io/api';
export const CHANNELS_URL = `${API_URL}/channels.json`;
export const COUNTRIES_URL = `${API_URL}/countries.json`;

// Only the fields the app uses; Zod drops the rest.
const channelSchema = z.object({
  id: z.string(),
  country: z.string(),
  network: z.string().nullable(),
  launched: z.string().nullable(),
  website: z.string().nullable(),
});
const countrySchema = z.object({ code: z.string(), name: z.string() });

/** Validates each item of a JSON array, skipping (and counting) the ones that don't match. */
function parseItems<T>(data: unknown, schema: z.ZodType<T>, source: string): T[] {
  if (!Array.isArray(data)) throw new ApiError('parse', `${source}: expected an array`);
  const items: T[] = [];
  for (const item of data) {
    const result = schema.safeParse(item);
    if (result.success) items.push(result.data);
  }
  const skipped = data.length - items.length;
  if (skipped > 0) logger.warn(`${source}: skipped ${skipped} entries that failed validation`);
  return items;
}

/** Metadata for the given channel ids, keyed by id. Ids iptv-org doesn't know are left out. */
export async function fetchChannelMetadata(
  channelIds: readonly string[],
  options?: RequestOptions,
): Promise<Record<string, ChannelMetadata>> {
  const [channelsData, countriesData] = await Promise.all([
    fetchJson(CHANNELS_URL, options),
    fetchJson(COUNTRIES_URL, options),
  ]);
  const wanted = new Set(channelIds);
  const channels = parseItems(channelsData, channelSchema, 'channels.json').filter((channel) =>
    wanted.has(channel.id),
  );
  const countryNames = new Map(
    parseItems(countriesData, countrySchema, 'countries.json').map((c) => [c.code, c.name]),
  );

  const metadata: Record<string, ChannelMetadata> = {};
  for (const channel of channels) {
    const country = countryNames.get(channel.country);
    metadata[channel.id] = {
      ...(country ? { country } : {}),
      ...(channel.network ? { network: channel.network } : {}),
      ...(channel.launched ? { launched: channel.launched } : {}),
      ...(channel.website ? { website: channel.website } : {}),
    };
  }
  return metadata;
}
