import { Dimensions, PixelRatio } from 'react-native';

/**
 * TV sizes are designed for a 1920×1080 screen and scaled by one factor, so proportions hold on
 * every TV: tvOS reports 1920×1080 points (factor 1), Android TV and Fire TV 960×540 dp (0.5).
 * The smaller of the two ratios keeps a design that fits 16:9 inside a non-16:9 window.
 *
 * Styles call this at module scope (`StyleSheet.create`), so the factor is read once. TV windows
 * never resize; a web-TV build that can would need a hook instead.
 */
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

/** Builds a scale function for a window. Exported for tests; use `scale` in the app. */
export function createScale(width: number, height: number): (size: number) => number {
  // A window that reports no size at startup would otherwise pin every size to 0 for the whole
  // session (an app that renders but is invisible). Fall back to the design size instead.
  const usable = (value: number) => Number.isFinite(value) && value > 0;
  const factor =
    usable(width) && usable(height) ? Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT) : 1;
  return (size) => PixelRatio.roundToNearestPixel(size * factor);
}

const { width, height } = Dimensions.get('window');

/** Converts a size from the 1920×1080 design to this TV's layout units. */
export const scale = createScale(width, height);
