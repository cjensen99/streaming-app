import { forwardRef, memo, type ReactNode, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { FocusGroup } from '../focus/FocusGroup';
import { FocusRail } from '../focus/FocusRail';
import type { FocusRailHandle } from '../focus/types';
import type { TileItem } from '../types/content';
import { Button } from '../ui/Button';
import { metrics } from '../ui/metrics';
import { Text } from '../ui/Text';
import { ContentTile } from './ContentTile';
import { RailSkeleton } from './RailSkeleton';

export interface ContentRailProps {
  title: string;
  /** Undefined while loading. Pass the same array until it changes, so tiles don't re-render. */
  items: readonly TileItem[] | undefined;
  /** Shows skeleton tiles (also shown while `items` is undefined). */
  isLoading?: boolean;
  /** The rail failed to load: shows an inline message with Retry instead of tiles. */
  isError?: boolean;
  onRetry?: () => void;
  /** Shown when the rail loaded with no items, e.g. "No channels in My List yet". */
  emptyMessage: string;
  /** Receives the selected tile's channel id. Pass a stable function. */
  onSelect: (id: string) => void;
  testID?: string;
}

/**
 * A titled horizontal row of channel tiles, with its own loading, error and empty states. Every
 * state keeps the same height, so rails below don't jump as rails above finish loading.
 *
 * On TVs the row is one focus group that's always there, whatever its state, so the remote moves
 * between rails in screen order; a rail without tiles (loading, empty) is simply skipped, and a
 * failed rail's Retry can be focused. The ref focuses a tile (when the rail has tiles).
 *
 * Rails hold up to 200 tiles, so the row is virtualised (see `FocusRail`).
 */
export const ContentRail = memo(
  forwardRef<FocusRailHandle, ContentRailProps>(function ContentRail(
    { title, testID, ...bodyProps },
    ref,
  ) {
    return (
      <View style={styles.rail} testID={testID}>
        <Text variant="heading" accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <FocusGroup direction="horizontal" style={styles.body}>
          <RailBody ref={ref} title={title} {...bodyProps} />
        </FocusGroup>
      </View>
    );
  }),
);

/** What's under the title: the error, loading, empty or tiles state (checked in that order). */
const RailBody = forwardRef<FocusRailHandle, Omit<ContentRailProps, 'testID'>>(function RailBody(
  { title, items, isLoading = false, isError = false, onRetry, emptyMessage, onSelect },
  ref,
) {
  const renderTile = useCallback(
    (item: TileItem) => <ContentTile item={item} onSelect={onSelect} />,
    [onSelect],
  );

  if (isError) {
    return (
      <RailMessage message={`Couldn't load ${title}.`}>
        {onRetry && (
          <Button label="Retry" onSelect={onRetry} accessibilityLabel={`Retry ${title}`} />
        )}
      </RailMessage>
    );
  }
  if (isLoading || !items) return <RailSkeleton accessibilityLabel={`Loading ${title}`} />;
  if (items.length === 0) return <RailMessage message={emptyMessage} />;

  return (
    <FocusRail
      ref={ref}
      data={items}
      renderItem={renderTile}
      keyExtractor={keyExtractor}
      itemWidth={metrics.tile.width}
      gap={metrics.tile.gap}
      inset={metrics.screen.paddingHorizontal}
      height={metrics.rail.bodyHeight}
    />
  );
});

/** A line of text (and optionally a button) in place of the tiles. */
function RailMessage({ message, children }: { message: string; children?: ReactNode }) {
  return (
    <View style={styles.message}>
      <Text tone="secondary">{message}</Text>
      {children}
    </View>
  );
}

const keyExtractor = (item: TileItem) => item.id;

const styles = StyleSheet.create({
  rail: { gap: metrics.rail.titleGap },
  title: { paddingHorizontal: metrics.screen.paddingHorizontal },
  body: { height: metrics.rail.bodyHeight },
  message: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.spacing.md,
    paddingHorizontal: metrics.screen.paddingHorizontal,
  },
});
