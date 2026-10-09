import { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import type { TileItem } from '../types/content';
import { colors } from '../ui/colors';
import { metrics } from '../ui/metrics';
import { Pressable } from '../ui/Pressable';
import { SkeletonGroup } from '../ui/Skeleton';
import { Text } from '../ui/Text';
import { ChannelArtwork } from './ChannelArtwork';
import { TileSkeleton } from './TileSkeleton';

export interface ContentTileProps {
  item: TileItem;
  /** Receives the tile's channel id. Pass one stable function for every tile in a list. */
  onSelect: (id: string) => void;
}

export const UNAVAILABLE_LABEL = 'Unavailable channel';

/**
 * A channel card: the channel's artwork (see `ChannelArtwork`), with the name underneath. The
 * single card used by every rail (and the My List grid later). Memoised by content (see
 * `areTilePropsEqual`), so a parent re-render doesn't re-render unchanged tiles.
 */
export const ContentTile = memo(function ContentTile({ item, onSelect }: ContentTileProps) {
  const { id } = item;
  const handleSelect = useCallback(() => onSelect(id), [onSelect, id]);

  // Not resolved yet: a placeholder, not selectable (there's nothing to open).
  if (item.status === 'pending') {
    return (
      <SkeletonGroup accessibilityLabel="Loading channel" testID={`tile-${id}`}>
        <TileSkeleton />
      </SkeletonGroup>
    );
  }

  const channel = item.status === 'available' ? item.channel : undefined;
  const name = channel?.name ?? UNAVAILABLE_LABEL;
  return (
    <Pressable
      onSelect={handleSelect}
      style={styles.tile}
      accessibilityRole="button"
      accessibilityLabel={name}
      testID={`tile-${id}`}
    >
      {({ focused }) => (
        <>
          <ChannelArtwork
            channel={channel}
            iconSize={metrics.tile.iconSize}
            style={[styles.card, focused && styles.cardFocused]}
          />
          <Text variant="caption" tone={focused ? 'primary' : 'secondary'} numberOfLines={1}>
            {name}
          </Text>
        </>
      )}
    </Pressable>
  );
}, areTilePropsEqual);

/**
 * Tiles are compared by what they show, not by object identity: hooks like `useMyList` rebuild
 * their item objects whenever anything changes, and comparing identities would re-render every
 * tile in the rail for a change to one.
 */
function areTilePropsEqual(prev: ContentTileProps, next: ContentTileProps): boolean {
  const a = prev.item;
  const b = next.item;
  const sameChannel =
    a.status === 'available' && b.status === 'available' ? a.channel === b.channel : true;
  return prev.onSelect === next.onSelect && a.id === b.id && a.status === b.status && sameChannel;
}

const styles = StyleSheet.create({
  tile: { width: metrics.tile.width, gap: metrics.tile.labelGap },
  card: {
    width: metrics.tile.width,
    padding: metrics.tile.logoPadding,
    // Always drawn (transparent until focused), so focusing doesn't shift the layout.
    borderWidth: metrics.focusBorderWidth,
    borderColor: 'transparent',
  },
  cardFocused: { borderColor: colors.focus },
});
