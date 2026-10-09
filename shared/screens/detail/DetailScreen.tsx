import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChannelArtwork } from '../../components/ChannelArtwork';
import { UNAVAILABLE_LABEL } from '../../components/ContentTile';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { type DetailScreenState, useDetailScreen } from '../../hooks/useDetailScreen';
import { DefaultFocus } from '../../focus/DefaultFocus';
import { FocusColumn } from '../../focus/FocusColumn';
import { FocusGroup } from '../../focus/FocusGroup';
import { FocusRoot } from '../../focus/FocusRoot';
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
  return (
    <FocusRoot active={screen.isActive}>
      <DetailContent screen={screen} />
    </FocusRoot>
  );
}

function DetailContent({ screen }: { screen: DetailScreenState }) {
  const insets = useSafeAreaInsets();
  const contentStyle = useMemo(
    () => [styles.content, { paddingBottom: insets.bottom + metrics.screen.paddingVertical }],
    [insets.bottom],
  );

  if (screen.isLoading) return <LoadingState message="Loading channel" />;
  if (screen.error) {
    return (
      <DefaultFocus>
        <ErrorState
          title="Couldn't load this channel"
          message="Check your connection and try again."
          onRetry={screen.retry}
        />
      </DefaultFocus>
    );
  }

  // Only a My List channel that iptv-org no longer lists can reach here without details.
  const { detail, isUnavailable } = screen;
  const name = detail?.summary.name ?? UNAVAILABLE_LABEL;
  const description = detail?.description ?? 'This channel is no longer available.';

  return (
    <FocusColumn contentContainerStyle={contentStyle}>
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
      {/* The first button that can take focus gets it: Play, or Remove when Play is disabled. */}
      <DefaultFocus>
        <FocusGroup direction="horizontal" style={styles.actions}>
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
        </FocusGroup>
      </DefaultFocus>
      {screen.fullMessage && (
        <Text tone="secondary" accessibilityRole="alert" accessibilityLiveRegion="polite">
          {screen.fullMessage}
        </Text>
      )}
    </FocusColumn>
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
