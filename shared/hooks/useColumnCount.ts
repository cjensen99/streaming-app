import { useWindowDimensions } from 'react-native';

/** How many columns of at least `minColumnWidth` fit in `width`: 1 to `maxColumns`. */
export function columnCount(width: number, minColumnWidth: number, maxColumns: number): number {
  return Math.max(1, Math.min(maxColumns, Math.floor(width / minColumnWidth)));
}

/**
 * How many columns of at least `minColumnWidth` fit across the screen, less `horizontalPadding`
 * on each side. From the window size, so it's right on the first render (no measuring pass).
 */
export function useColumnCount(
  minColumnWidth: number,
  maxColumns: number,
  horizontalPadding: number,
): number {
  const { width } = useWindowDimensions();
  return columnCount(width - 2 * horizontalPadding, minColumnWidth, maxColumns);
}
