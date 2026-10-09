import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { metrics } from '../ui/metrics';
import { SkeletonGroup } from '../ui/Skeleton';
import { RAIL_VISIBLE_TILES } from './railLayout';
import { TileSkeleton } from './TileSkeleton';

export interface RailSkeletonProps {
  /** What's loading, for screen readers, e.g. "Loading News". */
  accessibilityLabel: string;
  testID?: string;
}

/** The tiles of a rail that's still loading: enough placeholder cards to fill the screen width. */
export const RailSkeleton = memo(function RailSkeleton({
  accessibilityLabel,
  testID,
}: RailSkeletonProps) {
  return (
    <SkeletonGroup accessibilityLabel={accessibilityLabel} style={styles.row} testID={testID}>
      {Array.from({ length: RAIL_VISIBLE_TILES }, (_, index) => (
        <TileSkeleton key={index} />
      ))}
    </SkeletonGroup>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: metrics.tile.gap,
    paddingHorizontal: metrics.screen.paddingHorizontal,
    overflow: 'hidden',
  },
});
