import { StyleSheet, View } from 'react-native';
import { metrics } from '../ui/metrics';
import { Skeleton } from '../ui/Skeleton';

/** A placeholder in the shape of a `ContentTile`. Place it inside a `SkeletonGroup`. */
export function TileSkeleton() {
  return (
    <View style={styles.tile}>
      <Skeleton
        width={metrics.tile.width}
        height={metrics.tile.height}
        radius={metrics.radius.md}
      />
      <Skeleton width="60%" height={metrics.type.caption.fontSize} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { width: metrics.tile.width, gap: metrics.tile.labelGap },
});
