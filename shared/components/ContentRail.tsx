import { memo, type ReactNode, useCallback } from 'react';
import { FlatList, type ListRenderItem, Platform, StyleSheet, View } from 'react-native';
import type { TileItem } from '../types/content';
import { Button } from '../ui/Button';
import { metrics } from '../ui/metrics';
import { Text } from '../ui/Text';
import { ContentTile } from './ContentTile';
import { RAIL_ITEM_LENGTH, RAIL_VISIBLE_TILES } from './railLayout';
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
 * Rails hold up to 200 tiles, so the list is virtualised: tiles have a fixed width (positions are
 * computed, not measured), only about a screen's worth render at first and more are added as the
 * user scrolls, so logos are only downloaded for tiles that come near the screen.
 */
export const ContentRail = memo(function ContentRail({
  title,
  testID,
  ...bodyProps
}: ContentRailProps) {
  return (
    <View style={styles.rail} testID={testID}>
      <Text variant="heading" accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <View style={styles.body}>
        <RailBody title={title} {...bodyProps} />
      </View>
    </View>
  );
});

/** What's under the title: the error, loading, empty or tiles state (checked in that order). */
function RailBody({
  title,
  items,
  isLoading = false,
  isError = false,
  onRetry,
  emptyMessage,
  onSelect,
}: Omit<ContentRailProps, 'testID'>) {
  const renderItem = useCallback<ListRenderItem<TileItem>>(
    ({ item }) => <ContentTile item={item} onSelect={onSelect} />,
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
    <FlatList
      horizontal
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      initialNumToRender={RAIL_VISIBLE_TILES}
      maxToRenderPerBatch={RAIL_VISIBLE_TILES}
      // Screens of tiles kept rendered (default 21): one either side of the visible one.
      windowSize={3}
      // Detaching off-screen tiles saves memory on Android; on iOS it can blank rows.
      removeClippedSubviews={Platform.OS === 'android'}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
}

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

// Offsets include the list's leading padding, so scrolling to a tile lands exactly on it.
const getItemLayout = (_: ArrayLike<TileItem> | null | undefined, index: number) => ({
  length: metrics.tile.width,
  offset: metrics.screen.paddingHorizontal + RAIL_ITEM_LENGTH * index,
  index,
});

const styles = StyleSheet.create({
  rail: { gap: metrics.rail.titleGap },
  title: { paddingHorizontal: metrics.screen.paddingHorizontal },
  body: { height: metrics.rail.bodyHeight },
  listContent: { paddingHorizontal: metrics.screen.paddingHorizontal, gap: metrics.tile.gap },
  message: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.spacing.md,
    paddingHorizontal: metrics.screen.paddingHorizontal,
  },
});
