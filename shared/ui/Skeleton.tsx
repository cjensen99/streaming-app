import type { ReactNode } from 'react';
import { Animated, type DimensionValue, StyleSheet, View, type ViewProps } from 'react-native';
import { usePulseAnimation } from '../hooks/usePulseAnimation';
import { colors } from './colors';
import { metrics } from './metrics';

export interface SkeletonProps {
  width: DimensionValue;
  height: DimensionValue;
  /** Defaults to the small radius. */
  radius?: number;
}

/** A placeholder block in the shape of content that's still loading. Wrap blocks in `SkeletonGroup`. */
export function Skeleton({ width, height, radius = metrics.radius.sm }: SkeletonProps) {
  return <View style={[styles.block, { width, height, borderRadius: radius }]} />;
}

export interface SkeletonGroupProps extends Pick<ViewProps, 'style' | 'testID'> {
  children: ReactNode;
  /** What's loading, for screen readers, e.g. "Loading News". */
  accessibilityLabel: string;
}

/**
 * Pulses its skeletons together: one animation per group rather than per block, and screen
 * readers hear one "loading" label instead of every block.
 */
export function SkeletonGroup({ children, accessibilityLabel, style, testID }: SkeletonGroupProps) {
  const opacity = usePulseAnimation();
  return (
    <Animated.View
      testID={testID}
      style={[style, { opacity }]}
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.skeleton },
});
