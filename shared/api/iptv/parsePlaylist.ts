import type { ChannelSummary } from '../../types/content';
import { stableHash } from '../hash';

/**
 * Parses an iptv-org M3U playlist. Each channel is an `#EXTINF` line, optional `#EXTVLCOPT`
 * lines, then the stream URL:
 *
 *   #EXTINF:-1 tvg-id="2GB.au@SD" tvg-logo="https://…/2gb.png" group-title="News",2GB (1080p) [Geo-blocked]
 *   #EXTVLCOPT:http-referrer=https://example.com/
 *   https://example.com/live/index.m3u8
 *
 * Pure (no I/O). Entries that can't form a playable channel are skipped and counted: no URL, no
 * name, or a non-HTTP stream (`rtmp://`, `srt://`, …), which the video player can't play.
 */

export interface ParsedPlaylist {
  channels: ChannelSummary[];
  /** Entries that were malformed and left out. */
  skipped: number;
}

interface PendingEntry {
  attributes: Record<string, string>;
  title: string;
  headers: Record<string, string>;
}

/** `#EXTVLCOPT` options that become HTTP headers for the stream. */
const VLC_OPTION_HEADERS: Record<string, string> = {
  'http-referrer': 'Referer',
  'http-user-agent': 'User-Agent',
};

const ATTRIBUTE = /([\w-]+)="([^"]*)"/g;
const QUALITY = /\((\d{3,4}[pi])\)/i;
const LABEL = /\[([^\]]+)\]/g;

/** Splits `-1 key="v, w" key2="x",Title` at the first comma outside quotes. */
function splitInfo(info: string): { attributesPart: string; title: string } {
  let inQuotes = false;
  for (let i = 0; i < info.length; i++) {
    const char = info[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) {
      return { attributesPart: info.slice(0, i), title: info.slice(i + 1) };
    }
  }
  return { attributesPart: info, title: '' };
}

function parseAttributes(text: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const match of text.matchAll(ATTRIBUTE)) {
    const [, key, value] = match;
    if (key !== undefined && value !== undefined) attributes[key] = value.trim();
  }
  return attributes;
}

/** `"2GB (1080p) [Geo-blocked]"` → name `2GB`, quality `1080p`, labels `['Geo-blocked']`. */
function parseTitle(title: string) {
  const quality = QUALITY.exec(title)?.[1];
  const labels = [...title.matchAll(LABEL)].map((match) => (match[1] ?? '').trim());
  const name = title.replace(QUALITY, '').replace(LABEL, '').replace(/\s+/g, ' ').trim();
  return { name, quality, labels: labels.filter(Boolean) };
}

function toChannel(entry: PendingEntry, url: string): ChannelSummary | null {
  const { name, quality, labels } = parseTitle(entry.title);
  if (!name) return null;

  // `tvg-id` is `<channel>@<feed>`; without one, derive a stable id from the stream URL.
  const [channelId, feedId] = (entry.attributes['tvg-id'] ?? '').split('@');
  const categories = (entry.attributes['group-title'] ?? '')
    .split(';')
    .map((category) => category.trim())
    .filter((category) => category && category !== 'Undefined');

  return {
    id: channelId || `url-${stableHash(url)}`,
    ...(channelId && feedId ? { feedId } : {}),
    name,
    ...(entry.attributes['tvg-logo'] ? { logoUrl: entry.attributes['tvg-logo'] } : {}),
    categories,
    ...(quality ? { quality } : {}),
    labels,
    stream: { url, headers: entry.headers },
  };
}

export function parsePlaylist(text: string): ParsedPlaylist {
  const channels: ChannelSummary[] = [];
  let skipped = 0;
  let pending: PendingEntry | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      if (pending) skipped++; // the previous entry never got a URL
      const { attributesPart, title } = splitInfo(line.slice('#EXTINF:'.length));
      pending = { attributes: parseAttributes(attributesPart), title, headers: {} };
    } else if (line.startsWith('#EXTVLCOPT:')) {
      const [option, ...rest] = line.slice('#EXTVLCOPT:'.length).split('=');
      const header = VLC_OPTION_HEADERS[option ?? ''];
      if (pending && header && rest.length > 0) pending.headers[header] = rest.join('=');
    } else if (line.startsWith('#')) {
      // #EXTM3U header and other directives carry nothing the app uses.
    } else if (pending) {
      const channel = /^https?:\/\//.test(line) ? toChannel(pending, line) : null;
      if (channel) channels.push(channel);
      else skipped++;
      pending = null;
    } else {
      skipped++; // a URL with no #EXTINF before it
    }
  }
  if (pending) skipped++;

  return { channels, skipped };
}
