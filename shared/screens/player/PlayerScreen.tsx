import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { FocusRoot } from '../../focus/FocusRoot';
import { usePlayerScreen } from '../../hooks/usePlayerScreen';
import { Player } from '../../player/Player';
import { PlayerUI } from '../../player/PlayerUI';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../ui/colors';

type PlayerScreenProps = NativeStackScreenProps<RootStackParamList, 'Player'>;

/** One channel's stream, full screen, with `PlayerUI` over it. */
export function PlayerScreen({ route }: PlayerScreenProps) {
  const player = usePlayerScreen(route.params.channelId);
  return (
    // TVs: the error's buttons take focus, and activating keeps native focus on the anchor.
    <FocusRoot active={player.isActive}>
      <View style={styles.screen}>
        {player.source && player.phase !== 'error' && (
          <Player
            key={player.attempt}
            source={player.source}
            paused={player.paused}
            onReady={player.onReady}
            onBuffering={player.onBuffering}
            onError={player.onError}
            style={StyleSheet.absoluteFill}
          />
        )}
        <PlayerUI
          phase={player.phase}
          paused={player.paused}
          isWaiting={player.isWaiting}
          onTogglePause={player.togglePause}
          onRetry={player.retry}
          onBack={player.close}
        />
      </View>
    </FocusRoot>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.video },
});
