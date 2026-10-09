import { DarkTheme, type Theme } from '@react-navigation/native';
import { colors } from '../ui/colors';

/** React Navigation's dark theme in the app's colours (screen backgrounds, header). */
export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.background,
  },
};
