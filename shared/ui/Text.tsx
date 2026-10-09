import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native';
import { colors } from './colors';
import { metrics } from './metrics';

export type TextVariant = 'title' | 'heading' | 'body' | 'caption';
/** `inverse` is dark text for light backgrounds (the tile card, the primary button). */
export type TextTone = 'primary' | 'secondary' | 'inverse';

export interface TextProps extends RNTextProps {
  /** Size and weight. Defaults to `body`. */
  variant?: TextVariant;
  /** Colour. Defaults to `primary`. */
  tone?: TextTone;
}

/** App text: one of the type styles, in a token colour. Other `Text` props pass through. */
export function Text({ variant = 'body', tone = 'primary', style, ...props }: TextProps) {
  return <RNText {...props} style={[styles[variant], toneStyles[tone], style]} />;
}

const styles = StyleSheet.create({
  title: { ...metrics.type.title, fontWeight: '700' },
  heading: { ...metrics.type.heading, fontWeight: '600' },
  body: { ...metrics.type.body, fontWeight: '400' },
  caption: { ...metrics.type.caption, fontWeight: '500' },
});

const toneStyles = StyleSheet.create({
  primary: { color: colors.textPrimary },
  secondary: { color: colors.textSecondary },
  inverse: { color: colors.textInverse },
});
