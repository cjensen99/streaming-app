import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Focusable } from '../focus/Focusable';
import { colors } from '../ui/colors';
import { Icon } from '../ui/Icon';
import { metrics } from '../ui/metrics';
import { Spinner } from '../ui/Spinner';
import { PlaybackError } from './PlaybackError';
import { CONTROLS_HIDE_MS, type PlayerUIProps } from './types';

/**
 * What's drawn over the video (phones; TVs: `PlayerUI.tsx`, same props). A tap shows the controls
 * (play/pause in the middle, Back top-left) over a dimmed picture; they hide again after a few
 * seconds while playing, and stay while paused or waiting (spinner), so there's always a way out.
 * Errors show Retry and Back.
 */
export function PlayerUI({
  phase,
  paused,
  isWaiting,
  onTogglePause,
  onRetry,
  onBack,
}: PlayerUIProps) {
  if (phase === 'error') return <PlaybackError onRetry={onRetry} onBack={onBack} />;
  return (
    <TouchControls
      paused={paused}
      isWaiting={isWaiting}
      onTogglePause={onTogglePause}
      onBack={onBack}
    />
  );
}

function TouchControls({
  paused,
  isWaiting,
  onTogglePause,
  onBack,
}: Omit<PlayerUIProps, 'phase' | 'onRetry'>) {
  const insets = useSafeAreaInsets();
  const [shown, setShown] = useState(false);
  // Always up while paused (the way to resume) or waiting (the way out).
  const visible = shown || paused || isWaiting;

  // Restarts whenever they're shown again or play resumes.
  useEffect(() => {
    if (!shown || paused) return;
    const timeout = setTimeout(() => setShown(false), CONTROLS_HIDE_MS);
    return () => clearTimeout(timeout);
  }, [shown, paused]);

  const backPosition = {
    top: insets.top + metrics.screen.paddingVertical,
    left: insets.left + metrics.screen.paddingHorizontal,
  };

  return (
    <View style={styles.fill}>
      <Pressable
        style={styles.fill}
        onPress={() => setShown(!visible)}
        accessibilityLabel={visible ? 'Hide controls' : 'Show controls'}
        testID="player-surface"
      />
      {visible && (
        <View style={[styles.fill, styles.scrim, styles.center]} pointerEvents="box-none">
          {isWaiting && !paused ? (
            <Spinner />
          ) : (
            <Focusable
              style={styles.centerButton}
              onSelect={() => {
                setShown(true);
                onTogglePause();
              }}
              accessibilityRole="button"
              accessibilityLabel={paused ? 'Play' : 'Pause'}
            >
              <Icon
                name={paused ? 'play' : 'pause'}
                size={metrics.player.centerIcon}
                color={colors.textPrimary}
              />
            </Focusable>
          )}
          <Focusable
            style={[styles.backButton, backPosition]}
            onSelect={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Icon name="back" size={metrics.button.iconSize} color={colors.textPrimary} />
          </Focusable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: StyleSheet.absoluteFill,
  center: { alignItems: 'center', justifyContent: 'center' },
  scrim: { backgroundColor: colors.scrim },
  centerButton: {
    width: metrics.player.centerButton,
    height: metrics.player.centerButton,
    borderRadius: metrics.player.centerButton / 2,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    width: metrics.player.backButton,
    height: metrics.player.backButton,
    borderRadius: metrics.player.backButton / 2,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
