/**
 * Channel and rail domain types, built by `api/` from iptv-org data. They stay plain,
 * serialisable data. (My List saves only channel ids, never these.)
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
  /** Parent network, e.g. `ABC`. */
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

/**
 * One tile in a rail. Category rails hold only `available` tiles; My List also has saved channels
 * that aren't (or aren't yet) in this launch's rails.
 */
export type TileItem =
  /** In today's rails: show it and allow Play. */
  | { status: 'available'; id: string; channel: ChannelSummary }
  /** Every rail loaded and none contains it: iptv-org no longer lists it. Can only be removed. */
  | { status: 'unavailable'; id: string }
  /** Its rail is still loading, or failed this launch, so it can't be resolved yet. */
  | { status: 'pending'; id: string };
