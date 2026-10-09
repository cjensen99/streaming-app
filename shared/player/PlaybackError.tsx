import { StyleSheet, View } from 'react-native';
import { StateMessage } from '../components/StateMessage';
import { DefaultFocus } from '../focus/DefaultFocus';
import { FocusGroup } from '../focus/FocusGroup';
import { Button } from '../ui/Button';
import { colors } from '../ui/colors';
import { metrics } from '../ui/metrics';
import type { PlayerUIProps } from './types';

/** The player's error, on every platform: Retry (focused on TVs) and Back. */
export function PlaybackError({ onRetry, onBack }: Pick<PlayerUIProps, 'onRetry' | 'onBack'>) {
  return (
    <View style={styles.error}>
      <StateMessage
        icon="alert"
        title="Can't play this channel"
        message="The stream isn't responding. It may be offline or not available in your region."
        action={
          <DefaultFocus>
            <FocusGroup direction="horizontal" style={styles.actions}>
              <Button label="Retry" variant="primary" onSelect={onRetry} />
              <Button label="Back" onSelect={onBack} />
            </FocusGroup>
          </DefaultFocus>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  error: { ...StyleSheet.absoluteFill, backgroundColor: colors.background },
  actions: { flexDirection: 'row', gap: metrics.spacing.md },
});
