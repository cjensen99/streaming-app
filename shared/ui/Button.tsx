import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { Icon, type IconName } from './Icon';
import { metrics } from './metrics';
import { Focusable } from '../focus/Focusable';
import type { FocusState } from '../focus/types';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps {
  label: string;
  onSelect: () => void;
  /** `primary` (light) for a screen's main action. Defaults to `secondary`. */
  variant?: ButtonVariant;
  /** Shown before the label. */
  icon?: IconName;
  disabled?: boolean;
  /** Defaults to `label`. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function Button({
  label,
  onSelect,
  variant = 'secondary',
  icon,
  disabled = false,
  accessibilityLabel = label,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const style = ({ pressed, focused }: FocusState) => [
    styles.base,
    variant === 'primary' ? styles.primary : styles.secondary,
    pressed && (variant === 'primary' ? styles.primaryPressed : styles.secondaryPressed),
    focused && styles.focused,
    disabled && styles.disabled,
  ];

  return (
    <Focusable
      onSelect={onSelect}
      disabled={disabled}
      style={style}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      testID={testID}
    >
      {icon && (
        <Icon
          name={icon}
          size={metrics.button.iconSize}
          color={variant === 'primary' ? colors.textInverse : colors.textPrimary}
        />
      )}
      <Text variant="body" tone={variant === 'primary' ? 'inverse' : 'primary'} numberOfLines={1}>
        {label}
      </Text>
    </Focusable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: metrics.button.height,
    paddingHorizontal: metrics.button.paddingHorizontal,
    borderRadius: metrics.radius.md,
    // Always drawn (transparent until focused), so focusing doesn't shift the layout.
    borderWidth: metrics.focusBorderWidth,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: metrics.button.gap,
  },
  primary: { backgroundColor: colors.primaryButton },
  primaryPressed: { backgroundColor: colors.primaryButtonPressed },
  secondary: { backgroundColor: colors.surface },
  secondaryPressed: { backgroundColor: colors.surfacePressed },
  focused: { borderColor: colors.focus },
  disabled: { opacity: 0.4 },
});
