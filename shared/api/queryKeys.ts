import type { RailId } from './iptv/rails';

/** Every React Query key in one place. All iptv-org data lives under `['iptv', …]`. */
export const queryKeys = {
  /** The English feed keys from `eng.m3u`: an input to the rails, shared by all three. */
  englishFeeds: ['iptv', 'english-feeds'] as const,
  rail: (id: RailId) => ['iptv', 'rail', id] as const,
  /** `channelsKey` identifies the set of channel ids the metadata covers. */
  metadata: (channelsKey: string) => ['iptv', 'metadata', channelsKey] as const,
};
