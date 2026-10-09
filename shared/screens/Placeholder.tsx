// Temporary screen, replaced by the real navigator and Home screen in Phase 7. It renders the
// Phase 6 components with live data so they can be checked on every device.
import { memo, useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ContentRail } from '../components/ContentRail';
import { NotConnectedState } from '../components/NotConnectedState';
import { type HomeRail, useHomeRails } from '../hooks/useHomeRails';
import { useIsOnline } from '../hooks/useIsOnline';
import { useMyList } from '../hooks/useMyList';
import type { TileItem } from '../types/content';
import { colors } from '../ui/colors';
import { metrics } from '../ui/metrics';
import { Text } from '../ui/Text';
import { logger } from '../utils/logger';

const onSelect = (id: string) => logger.debug(`Selected ${id}`);

export default function Placeholder() {
  const isOnline = useIsOnline();
  const rails = useHomeRails();
  const myList = useMyList();

  if (!isOnline) return <NotConnectedState />;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text variant="title" style={styles.title}>
        StreamShelf
      </Text>
      <ContentRail
        title="My List"
        items={myList.isLoading ? undefined : myList.items}
        emptyMessage="No channels in My List yet"
        onSelect={onSelect}
      />
      {rails.map((homeRail) => (
        <CategoryRail key={homeRail.config.id} homeRail={homeRail} />
      ))}
    </ScrollView>
  );
}

const CategoryRail = memo(function CategoryRail({ homeRail }: { homeRail: HomeRail }) {
  const { config, rail, isLoading, error, retry } = homeRail;
  const items = useMemo(
    () =>
      rail?.items.map((channel): TileItem => ({ status: 'available', id: channel.id, channel })),
    [rail],
  );
  return (
    <ContentRail
      title={config.title}
      items={items}
      isLoading={isLoading}
      isError={!!error}
      onRetry={retry}
      emptyMessage="No channels right now"
      onSelect={onSelect}
    />
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingVertical: metrics.screen.paddingVertical, gap: metrics.spacing.xl },
  title: { paddingHorizontal: metrics.screen.paddingHorizontal },
});
