import brand from '@app/config/brand.json';

/**
 * Colour tokens. The app is dark-only (`userInterfaceStyle: 'dark'`). The background comes from
 * the brand file the app configs also use for the splash and native window, so the first frame
 * and the app can't differ.
 */
const palette = {
  black: brand.colors.background,
  grey900: '#16161D',
  grey800: '#202029',
  grey700: '#2C2C37',
  grey400: '#8E8E9A',
  grey200: '#C9C9D1',
  grey100: '#E9E9EE',
  white: '#F5F5F7',
  blue: '#3D8BFF',
} as const;

export const colors = {
  background: palette.black,
  /** Raised areas: skeletons, secondary buttons, the unavailable tile. */
  surface: palette.grey800,
  surfacePressed: palette.grey700,
  /** Behind channel logos: most are transparent PNGs, many of them dark. */
  tile: palette.grey100,
  /** A screen's main action (light, so the blue focus outline shows on it). */
  primaryButton: palette.grey100,
  primaryButtonPressed: palette.grey200,
  textPrimary: palette.white,
  textSecondary: palette.grey400,
  /** Text on light backgrounds: the tile card and the primary button. */
  textInverse: palette.grey900,
  /** Spinners and other highlights. */
  accent: palette.blue,
  /** The outline around the focused element (TV remote or keyboard), on every element. */
  focus: palette.blue,
  skeleton: palette.grey800,
  icon: palette.grey200,
  /** Behind the video (letterboxing). */
  video: '#000000',
  /** Dims the video under the player's controls and pause icon. */
  scrim: 'rgba(0, 0, 0, 0.55)',
} as const;
