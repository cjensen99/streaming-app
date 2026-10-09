import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';
import { colors } from './colors';

export type SpinnerProps = Omit<ActivityIndicatorProps, 'color'>;

/** The platform activity indicator in the accent colour. Defaults to the large size. */
export function Spinner({ size = 'large', ...props }: SpinnerProps) {
  return (
    <ActivityIndicator accessibilityLabel="Loading" {...props} size={size} color={colors.accent} />
  );
}
