import type { PlaybackPhase, PlayerError } from './types';

/**
 * What the player screen is doing, as a pure reducer (no timers or platform code, so it tests
 * anywhere). Retry after an error starts a fresh `attempt`.
 */
export interface PlaybackState {
  phase: PlaybackPhase;
  paused: boolean;
  buffering: boolean;
  /** Counts Retries: the player is recreated for each one. */
  attempt: number;
  error: PlayerError | null;
}

export type PlaybackAction =
  | { type: 'ready' }
  | { type: 'buffering'; isBuffering: boolean }
  | { type: 'error'; error: PlayerError }
  | { type: 'togglePause' }
  | { type: 'retry' };

export const initialPlayback: PlaybackState = {
  phase: 'loading',
  paused: false,
  buffering: false,
  attempt: 0,
  error: null,
};

/** No picture yet, or a stall the user didn't ask for: a spinner shows, and a timeout runs. */
export const isWaiting = ({ phase, paused, buffering }: PlaybackState): boolean =>
  phase === 'loading' || (phase === 'playing' && buffering && !paused);

export function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  // After an error only Retry does anything: late events from the old player are ignored.
  if (state.phase === 'error' && action.type !== 'retry') return state;
  switch (action.type) {
    case 'ready':
      return state.phase === 'loading' ? { ...state, phase: 'playing', buffering: false } : state;
    case 'buffering':
      return { ...state, buffering: action.isBuffering };
    case 'error':
      return { ...state, phase: 'error', paused: false, buffering: false, error: action.error };
    case 'togglePause':
      // Nothing to pause until the stream has started.
      return state.phase === 'playing' ? { ...state, paused: !state.paused } : state;
    case 'retry':
      return state.phase === 'error' ? { ...initialPlayback, attempt: state.attempt + 1 } : state;
  }
}
