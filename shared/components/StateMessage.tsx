import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, type IconName } from '../ui/Icon';
import { metrics } from '../ui/metrics';
import { Text } from '../ui/Text';

export interface StateMessageProps {
  title?: string;
  message?: string;
  icon?: IconName;
  /** E.g. a Retry button, shown under the message. */
  action?: ReactNode;
  testID?: string;
}

/**
 * The centred layout shared by the full-area loading, empty, error and not-connected states, so
 * they all look alike. It fills its parent; place it where the content would have been.
 */
export function StateMessage({ title, message, icon, action, testID }: StateMessageProps) {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.content} accessible>
        {icon && <Icon name={icon} size={metrics.stateIcon} />}
        {title && (
          <Text variant="heading" style={styles.text}>
            {title}
          </Text>
        )}
        {message && (
          <Text tone="secondary" style={styles.text}>
            {message}
          </Text>
        )}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: metrics.screen.paddingHorizontal,
    gap: metrics.spacing.lg,
  },
  content: { alignItems: 'center', gap: metrics.spacing.sm, maxWidth: metrics.stateMaxWidth },
  text: { textAlign: 'center' },
});
