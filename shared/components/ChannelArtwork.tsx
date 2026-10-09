import { useState } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import type { ChannelSummary } from '../types/content';
import { colors } from '../ui/colors';
import { Icon } from '../ui/Icon';
import { Image } from '../ui/Image';
import { metrics } from '../ui/metrics';
import { Text } from '../ui/Text';

export interface ChannelArtworkProps {
  /** Undefined for an unavailable channel: a dark card with a warning icon. */
  channel: ChannelSummary | undefined;
  iconSize: number;
  /** Size and padding, plus anything else the caller adds (e.g. a focus outline). */
  style?: StyleProp<ViewStyle>;
}

/**
 * A channel's logo centred on a light 16:9 card, fitted inside and never cropped. Shared by the
 * rail tiles and the Detail screen so both look the same. With no logo (or one that fails to
 * load), the channel's name is written on the card instead.
 */
export function ChannelArtwork({ channel, iconSize, style }: ChannelArtworkProps) {
  return (
    <View style={[styles.card, channel ? styles.light : styles.unavailable, style]}>
      {channel ? <Logo channel={channel} /> : <Icon name="alert" size={iconSize} />}
    </View>
  );
}

function Logo({ channel }: { channel: ChannelSummary }) {
  const [failed, setFailed] = useState(false);
  if (!channel.logoUrl || failed) {
    return (
      <Text variant="heading" tone="inverse" numberOfLines={2} style={styles.name}>
        {channel.name}
      </Text>
    );
  }
  return (
    <Image
      uri={channel.logoUrl}
      style={styles.logo}
      onError={() => setFailed(true)}
      accessible={false}
      testID={`logo-${channel.id}`}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 16 / 9,
    borderRadius: metrics.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  light: { backgroundColor: colors.tile },
  unavailable: { backgroundColor: colors.surface },
  logo: { width: '100%', height: '100%' },
  name: { textAlign: 'center' },
});
