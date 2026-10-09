import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChannelArtwork } from '../../components/ChannelArtwork';
import { UNAVAILABLE_LABEL } from '../../components/ContentTile';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { useDetailScreen } from '../../hooks/useDetailScreen';
import type { RootStackParamList } from '../../types/navigation';
import { Button } from '../../ui/Button';
import { metrics } from '../../ui/metrics';
import { Text } from '../../ui/Text';
import { ChannelFacts } from './ChannelFacts';

type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Detail'>;

/**
 * One channel: artwork, name, description and facts, then Play and the My List button. The same
 * layout on phones and TVs (facts switch between one and two columns by width).
 */
export function DetailScreen({ route }: DetailScreenProps) {
  const screen = useDetailScreen(route.params.channelId);
  const insets = useSafeAreaInsets();

  if (screen.isLoading) return <LoadingState message="Loading channel" />;
  if (screen.error) {
    return (
      <ErrorState
        title="Couldn't load this channel"
        message="Check your connection and try again."
        onRetry={screen.retry}
      />
    );
  }

  // Only a My List channel that iptv-org no longer lists can reach here without details.
  const { detail, isUnavailable } = screen;
  const name = detail?.summary.name ?? UNAVAILABLE_LABEL;
  const description = detail?.description ?? 'This channel is no longer available.';

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + metrics.screen.paddingVertical },
      ]}
    >
      <ChannelArtwork
        channel={detail?.summary}
        iconSize={metrics.tile.iconSize}
        style={styles.artwork}
      />
      <View style={styles.text}>
        <Text variant="title" accessibilityRole="header">
          {name}
        </Text>
        <Text tone="secondary">{description}</Text>
      </View>
      {detail && (
        <ChannelFacts
          facts={screen.facts}
          website={screen.website}
          isLoading={screen.isMetadataLoading}
        />
      )}
      <View style={styles.actions}>
        <Button
          label="Play"
          icon="play"
          variant="primary"
          onSelect={screen.play}
          disabled={isUnavailable}
        />
        <Button
          label={screen.isSaved ? 'Remove from My List' : 'Add to My List'}
          icon={screen.isSaved ? 'check' : 'plus'}
          onSelect={screen.toggleMyList}
        />
      </View>
      {screen.fullMessage && (
        <Text tone="secondary" accessibilityRole="alert" accessibilityLiveRegion="polite">
          {screen.fullMessage}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: metrics.screen.paddingHorizontal,
    paddingTop: metrics.screen.paddingVertical,
    gap: metrics.spacing.lg,
  },
  artwork: { width: metrics.detail.artworkWidth, padding: metrics.detail.artworkPadding },
  text: { gap: metrics.spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: metrics.spacing.md },
});
