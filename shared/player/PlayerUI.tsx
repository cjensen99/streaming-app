import { StyleSheet, View } from 'react-native';
import { colors } from '../ui/colors';
import { Icon } from '../ui/Icon';
import { metrics } from '../ui/metrics';
import { Spinner } from '../ui/Spinner';
import { PlaybackError } from './PlaybackError';
import type { PlayerUIProps } from './types';

/**
 * What's drawn over the video (TVs; phones: `PlayerUI.mobile.tsx`, same props). A dimmed screen
 * with a pause icon while paused (the remote's Select or Play/Pause toggles it), a spinner while
 * waiting, and the error with Retry and Back. Back itself is the remote's.
 */
export function PlayerUI({ phase, paused, isWaiting, onRetry, onBack }: PlayerUIProps) {
  if (phase === 'error') return <PlaybackError onRetry={onRetry} onBack={onBack} />;
  if (paused) {
    return (
      <View style={[styles.fill, styles.scrim, styles.center]} testID="player-paused">
        <Icon name="pause" size={metrics.player.centerIcon} color={colors.textPrimary} />
      </View>
    );
  }
  if (!isWaiting) return null;
  return (
    <View style={[styles.fill, styles.center]} pointerEvents="none">
      <Spinner />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: StyleSheet.absoluteFill,
  center: { alignItems: 'center', justifyContent: 'center' },
  scrim: { backgroundColor: colors.scrim },
});
