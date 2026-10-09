import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContentRail } from '../../components/ContentRail';
import { ErrorState } from '../../components/ErrorState';
import { useHomeScreen } from '../../hooks/useHomeScreen';
import { metrics } from '../../ui/metrics';
import { Text } from '../../ui/Text';
import { CategoryRail } from './CategoryRail';

/** The main menu: My List first, then the News, Sports and Movies rails. */
export function HomeScreen() {
  const { myList, rails, allRailsFailed, retryAllRails, openChannel } = useHomeScreen();
  const insets = useSafeAreaInsets();
  const contentStyle = useMemo(
    () => [
      styles.content,
      {
        paddingTop: insets.top + metrics.screen.paddingVertical,
        paddingBottom: insets.bottom + metrics.screen.paddingVertical,
      },
    ],
    [insets.top, insets.bottom],
  );

  if (allRailsFailed) {
    return (
      <ErrorState
        title="Couldn't load channels"
        message="Check your connection and try again."
        onRetry={retryAllRails}
        testID="home-error"
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={contentStyle}>
      <Text variant="title" accessibilityRole="header" style={styles.title}>
        StreamShelf
      </Text>
      <ContentRail
        title="My List"
        items={myList.isLoading ? undefined : myList.items}
        emptyMessage="No channels in My List yet"
        onSelect={openChannel}
        testID="rail-my-list"
      />
      {rails.map((homeRail) => (
        <CategoryRail key={homeRail.config.id} homeRail={homeRail} onSelect={openChannel} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: metrics.spacing.xl },
  title: { paddingHorizontal: metrics.screen.paddingHorizontal },
});
