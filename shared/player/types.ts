import type { StyleProp, ViewStyle } from 'react-native';
import type { StreamSource } from '../types/content';

/** Why a stream stopped, as the platform player reported it (for logs, not for users). */
export interface PlayerError {
  message: string;
  code?: string;
}

/**
 * The video player's shared interface. Each platform implements `Player` with these props:
 * `Player.tsx` uses react-native-video (iOS, tvOS, Android, Android TV, Fire TV); a web build
 * would add `Player.web.tsx` (e.g. Shaka Player). It only plays the stream and reports what
 * happens; the playback state and the UI over it are shared (`playback.ts`, `PlayerUI`).
 */
export interface PlayerProps {
  source: StreamSource;
  paused: boolean;
  /** The stream has loaded and is ready to play. */
  onReady: () => void;
  /** Playback stalled waiting for data (`true`), or carried on (`false`). */
  onBuffering: (isBuffering: boolean) => void;
  onError: (error: PlayerError) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * `loading` until the stream is ready, then `playing` (which includes paused and buffering), or
 * `error` until Retry.
 */
export type PlaybackPhase = 'loading' | 'playing' | 'error';

/** What `PlayerUI` (drawn over the video) shows and does. */
export interface PlayerUIProps {
  phase: PlaybackPhase;
  paused: boolean;
  /** No picture yet, or stalled: shows a spinner. */
  isWaiting: boolean;
  onTogglePause: () => void;
  onRetry: () => void;
  onBack: () => void;
}

/** Phones: how long the controls stay up after a tap while the stream plays. */
export const CONTROLS_HIDE_MS = 3000;
