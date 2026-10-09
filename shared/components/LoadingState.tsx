import { StyleSheet, View } from 'react-native';
import { metrics } from '../ui/metrics';
import { Spinner } from '../ui/Spinner';
import { Text } from '../ui/Text';

export interface LoadingStateProps {
  /** Shown under the spinner and read by screen readers. Defaults to "Loading". */
  message?: string;
  testID?: string;
}

/** A centred spinner that fills its parent, for content with no useful skeleton. */
export function LoadingState({ message, testID }: LoadingStateProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Spinner accessibilityLabel={message ?? 'Loading'} />
      {message && <Text tone="secondary">{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: metrics.spacing.md },
});
