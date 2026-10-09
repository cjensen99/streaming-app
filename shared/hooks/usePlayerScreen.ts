import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useReducer } from 'react';
import {
  initialPlayback,
  isWaiting as isPlaybackWaiting,
  playbackReducer,
} from '../player/playback';
import type { PlaybackPhase, PlayerError } from '../player/types';
import { useLandscape } from '../player/useLandscape';
import type { StreamSource } from '../types/content';
import { logger } from '../utils/logger';
import { useChannelDetail } from './useChannelDetail';
import { useInputLayer } from './useInputLayer';
import { useIsOnline } from './useIsOnline';

/** A stream that hasn't started, or has stalled, for this long counts as failed. */
export const STALL_TIMEOUT_MS = 15_000;

export interface PlayerScreenState {
  /** The player is the screen showing. */
  isActive: boolean;
  /** The channel's stream (undefined until its rail is known, or if it can't be found). */
  source: StreamSource | undefined;
  phase: PlaybackPhase;
  paused: boolean;
  /** Show a spinner: no picture yet, or stalled while playing. */
  isWaiting: boolean;
  /** Changes on each Retry: give it to the player as its `key`, so a fresh one starts. */
  attempt: number;
  togglePause: () => void;
  retry: () => void;
  /** Back to the Detail screen; the stream stops as the player unmounts. */
  close: () => void;
  onReady: () => void;
  onBuffering: (isBuffering: boolean) => void;
  onError: (error: PlayerError) => void;
}

/**
 * The full-screen player: plays the channel's stream, Select / Play-Pause (remote) toggle pause,
 * Back returns to Detail (the app's Back navigation, no special case). Phones turn to landscape.
 */
export function usePlayerScreen(channelId: string): PlayerScreenState {
  const navigation = useNavigation();
  const isActive = useIsFocused();
  const isOnline = useIsOnline();
  const channel = useChannelDetail(channelId);
  const [state, dispatch] = useReducer(playbackReducer, initialPlayback);
  useLandscape();

  const source = channel.detail?.summary.stream;
  // Normally the channel is already loaded (Detail showed it); without it there's nothing to play.
  const channelMissing = !source && !channel.isLoading;
  const phase = channelMissing ? 'error' : state.phase;
  const isWaiting = !channelMissing && isPlaybackWaiting(state);

  const onError = useCallback(
    (error: PlayerError) => {
      logger.warn(`Playback failed for ${channelId}: ${error.message}`, error.code);
      dispatch({ type: 'error', error });
    },
    [channelId],
  );

  // Players can wait forever on a dead stream without reporting an error.
  useEffect(() => {
    if (!isWaiting) return;
    const timeout = setTimeout(
      () => onError({ message: 'No picture before the timeout', code: 'timeout' }),
      STALL_TIMEOUT_MS,
    );
    return () => clearTimeout(timeout);
  }, [isWaiting, onError]);

  const togglePause = useCallback(() => dispatch({ type: 'togglePause' }), []);
  const { retry: retryChannel } = channel;
  const retry = useCallback(() => {
    if (channelMissing) retryChannel();
    dispatch({ type: 'retry' });
  }, [channelMissing, retryChannel]);

  // Select and Play/Pause pause and resume. On the error screen Select presses the focused button.
  useInputLayer(
    ({ key }) => {
      if (key !== 'select' && key !== 'playPause') return 'pass';
      if (phase === 'error') return key === 'select' ? 'pass' : 'handled';
      togglePause();
      return 'handled';
    },
    { enabled: isActive && isOnline },
  );

  return {
    isActive,
    source,
    phase,
    paused: state.paused,
    isWaiting,
    attempt: state.attempt,
    togglePause,
    retry,
    close: useCallback(() => navigation.goBack(), [navigation]),
    onReady: useCallback(() => dispatch({ type: 'ready' }), []),
    onBuffering: useCallback(
      (isBuffering: boolean) => dispatch({ type: 'buffering', isBuffering }),
      [],
    ),
    onError,
  };
}
