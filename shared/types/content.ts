/**
 * Channel and rail domain types. `api/` builds them from iptv-org data (Phase 4) and My List
 * persists `ChannelSummary` snapshots (Phase 5), so they stay plain, serialisable data.
 */

/** Where and how to play a channel. Some streams require extra HTTP headers (e.g. a referrer). */
export interface StreamSource {
  url: string;
  headers: Record<string, string>;
}

/** Everything a tile, a rail and My List need: enough to render and play without more fetches. */
export interface ChannelSummary {
  /** iptv-org `tvg-id` without its feed suffix, or an id derived from the stream URL. */
  id: string;
  /** The feed part of `tvg-id` after `@`, e.g. `SD`. */
  feedId?: string;
  name: string;
  logoUrl?: string;
  categories: string[];
  /** Resolution from the playlist name, e.g. `1080p`. */
  quality?: string;
  /** Playlist flags from the name, e.g. `Geo-blocked`, `Not 24/7`. */
  labels: string[];
  stream: StreamSource;
}

/** Extra details from iptv-org's `channels.json`, loaded in the background for Detail. */
export interface ChannelMetadata {
  /** Display name, e.g. `United States`. */
  country?: string;
  /** Display names, e.g. `English`. */
  languages: string[];
  network?: string;
  /** ISO date, e.g. `1996-10-07`. */
  launched?: string;
  website?: string;
}

/** What the Detail screen shows. `metadata` is undefined until it has loaded. */
export interface ChannelDetail {
  summary: ChannelSummary;
  metadata?: ChannelMetadata;
  /** Built from the metadata (iptv-org has no description field), with fallbacks. */
  description: string;
}

/** A horizontal row of channels on Home. */
export interface Rail {
  id: string;
  title: string;
  items: ChannelSummary[];
}
