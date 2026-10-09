import { useMemo } from 'react';
import Video, { type OnBufferData, type OnVideoErrorData } from 'react-native-video';
import type { PlayerError, PlayerProps } from './types';

/** The platform player's error, whichever fields this platform filled in. */
function toPlayerError({ error }: OnVideoErrorData): PlayerError {
  const message =
    error.errorString ?? error.localizedDescription ?? error.error ?? 'Unknown playback error';
  const code = error.errorCode ?? (error.code === undefined ? undefined : String(error.code));
  return { message, code };
}

/** Plays a stream full-size with react-native-video, without its own controls (`PlayerUI` draws them). */
export function Player({ source, paused, onReady, onBuffering, onError, style }: PlayerProps) {
  const videoSource = useMemo(() => ({ uri: source.url, headers: source.headers }), [source]);
  return (
    <Video
      testID="video"
      source={videoSource}
      paused={paused}
      style={style}
      resizeMode="contain"
      controls={false}
      // Android TV: native focus stays on the app's focus anchor, so remote keys keep arriving.
      focusable={false}
      onLoad={onReady}
      onBuffer={({ isBuffering }: OnBufferData) => onBuffering(isBuffering)}
      onError={(event: OnVideoErrorData) => onError(toPlayerError(event))}
    />
  );
}
