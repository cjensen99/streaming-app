import { memo, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ChannelSummary, TileItem } from '../types/content';
import { colors } from '../ui/colors';
import { Icon } from '../ui/Icon';
import { Image } from '../ui/Image';
import { metrics } from '../ui/metrics';
import { Pressable } from '../ui/Pressable';
import { SkeletonGroup } from '../ui/Skeleton';
import { Text } from '../ui/Text';
import { TileSkeleton } from './TileSkeleton';

export interface ContentTileProps {
  item: TileItem;
  /** Receives the tile's channel id. Pass one stable function for every tile in a list. */
  onSelect: (id: string) => void;
}

export const UNAVAILABLE_LABEL = 'Unavailable channel';

/**
 * A channel card: the logo centred on a light 16:9 card (fitted inside, never cropped), with the
 * name underneath. The single card used by every rail (and the My List grid later). Memoised:
 * with a stable `item` and `onSelect`, a parent re-render doesn't re-render the tile.
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

  const name = item.status === 'available' ? item.channel.name : UNAVAILABLE_LABEL;
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
          <View
            style={[
              styles.card,
              item.status === 'available' ? styles.cardLight : styles.cardUnavailable,
              focused && styles.cardFocused,
            ]}
          >
            {item.status === 'available' ? (
              <TileArtwork channel={item.channel} />
            ) : (
              <Icon name="alert" size={metrics.tile.iconSize} />
            )}
          </View>
          <Text variant="caption" tone={focused ? 'primary' : 'secondary'} numberOfLines={1}>
            {name}
          </Text>
        </>
      )}
    </Pressable>
  );
});

/** The logo, or the channel name on the card when there's no logo or it fails to load. */
function TileArtwork({ channel }: { channel: ChannelSummary }) {
  const [logoFailed, setLogoFailed] = useState(false);
  if (!channel.logoUrl || logoFailed) {
    return (
      <Text variant="heading" tone="inverse" numberOfLines={2} style={styles.fallbackName}>
        {channel.name}
      </Text>
    );
  }
  return (
    <Image
      uri={channel.logoUrl}
      style={styles.logo}
      onError={() => setLogoFailed(true)}
      accessible={false}
      testID={`tile-logo-${channel.id}`}
    />
  );
}

const styles = StyleSheet.create({
  tile: { width: metrics.tile.width, gap: metrics.tile.labelGap },
  card: {
    width: metrics.tile.width,
    height: metrics.tile.height,
    borderRadius: metrics.radius.md,
    // Always drawn (transparent until focused), so focusing doesn't shift the layout.
    borderWidth: metrics.focusBorderWidth,
    borderColor: 'transparent',
    padding: metrics.tile.logoPadding,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardLight: { backgroundColor: colors.tile },
  cardUnavailable: { backgroundColor: colors.surface },
  cardFocused: { borderColor: colors.focus },
  logo: { width: '100%', height: '100%' },
  fallbackName: { textAlign: 'center' },
});
