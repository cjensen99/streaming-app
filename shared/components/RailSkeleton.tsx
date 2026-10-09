import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { metrics } from '../ui/metrics';
import { SkeletonGroup } from '../ui/Skeleton';
import { Spinner } from '../ui/Spinner';
import { RAIL_VISIBLE_TILES } from './railLayout';
import { TileSkeleton } from './TileSkeleton';

export interface RailSkeletonProps {
  /** What's loading, for screen readers, e.g. "Loading News". */
  accessibilityLabel: string;
  testID?: string;
}

/**
 * The tiles of a rail that's still loading: a spinner at the start of the row, then enough
 * placeholder cards to fill the screen width.
 */
export const RailSkeleton = memo(function RailSkeleton({
  accessibilityLabel,
  testID,
}: RailSkeletonProps) {
  return (
    <View style={styles.row}>
      {/* Outside the group, so it doesn't fade with the pulse; the group's label covers it. */}
      <View style={styles.spinner} importantForAccessibility="no-hide-descendants">
        <Spinner testID="rail-spinner" accessibilityElementsHidden />
      </View>
      <SkeletonGroup accessibilityLabel={accessibilityLabel} style={styles.tiles} testID={testID}>
        {Array.from({ length: RAIL_VISIBLE_TILES }, (_, index) => (
          <TileSkeleton key={index} />
        ))}
      </SkeletonGroup>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: metrics.tile.gap,
    paddingHorizontal: metrics.screen.paddingHorizontal,
    overflow: 'hidden',
  },
  tiles: { flexDirection: 'row', gap: metrics.tile.gap },
  // As tall as a card, so the spinner sits level with the cards' middle.
  spinner: { height: metrics.tile.height, justifyContent: 'center' },
});
