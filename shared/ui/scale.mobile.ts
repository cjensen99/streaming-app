import { Dimensions } from 'react-native';

/**
 * Phone sizes are designed for a 390-wide portrait phone.
 * Layout units are already density-independent, so the factor only nudges sizes on very small or
 * very large phones, and is clamped so neither end runs away. Tablets get the upper clamp.
 *
 * Read once at startup: menus are portrait-only, so the short side never changes.
 */
const DESIGN_SHORT_SIDE = 390;
const MIN_FACTOR = 0.85;
const MAX_FACTOR = 1.2;

/** Builds a scale function for a window. Exported for tests; use `scale` in the app. */
export function createScale(width: number, height: number): (size: number) => number {
  const shortSide = Math.min(width, height);
  const factor =
    Number.isFinite(shortSide) && shortSide > 0
      ? Math.min(MAX_FACTOR, Math.max(MIN_FACTOR, shortSide / DESIGN_SHORT_SIDE))
      : 1;
  return (size) => Math.round(size * factor);
}

const { width, height } = Dimensions.get('window');

/** Converts a size from the 390-wide phone design to this phone's layout units. */
export const scale = createScale(width, height);
