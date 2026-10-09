import type { DimensionValue } from 'react-native';

/** Font size and line height of one text style. */
export interface TypeSize {
  fontSize: number;
  lineHeight: number;
}

/**
 * Every size the UI uses. `metrics.ts` (TV) and `metrics.mobile.ts` (phone) each provide the full
 * set for their form factor, so components stay single files and never call `scale` directly.
 */
export interface Metrics {
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
  radius: { sm: number; md: number };
  type: { title: TypeSize; heading: TypeSize; body: TypeSize; caption: TypeSize };
  /** Space between the screen edge and content (TV: the overscan-safe area). */
  screen: { paddingHorizontal: number; paddingVertical: number };
  /** Rail cards: fixed size, so a rail can compute any tile's position without measuring. */
  tile: {
    width: number;
    height: number;
    gap: number;
    logoPadding: number;
    labelGap: number;
    /** The icon on an unavailable channel's card. */
    iconSize: number;
  };
  rail: {
    titleGap: number;
    /** Height of a rail's tiles and labels, kept by its loading/error/empty states too. */
    bodyHeight: number;
  };
  detail: {
    /** The 16:9 artwork card at the top of Detail. */
    artworkWidth: DimensionValue;
    artworkPadding: number;
    /** Facts sit in 2 columns when both get at least this width, else in 1. */
    factColumnMinWidth: number;
  };
  button: { height: number; paddingHorizontal: number; iconSize: number; gap: number };
  player: {
    /** The pause icon (TV) or the play/pause icon in the round button (phones). */
    centerIcon: number;
    /** Phones: the round play/pause button. */
    centerButton: number;
    /** Phones: the round Back button. */
    backButton: number;
  };
  /** Icons in full-screen states (error, not connected). */
  stateIcon: number;
  /** Max width of the centred message in full-screen states. */
  stateMaxWidth: number;
  /** The outline drawn around the focused element on TV. */
  focusBorderWidth: number;
}
