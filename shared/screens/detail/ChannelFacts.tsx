import { Linking, StyleSheet, View } from 'react-native';
import type { ChannelFact } from '../../api/iptv/channelFacts';
import { useColumnCount } from '../../hooks/useColumnCount';
import { metrics } from '../../ui/metrics';
import { Skeleton, SkeletonGroup } from '../../ui/Skeleton';
import { Text } from '../../ui/Text';
import { device } from '../../utils/device';

interface ChannelFactsProps {
  facts: ChannelFact[];
  website: string | undefined;
  /** The background metadata download hasn't finished: show placeholders instead. */
  isLoading: boolean;
}

const MAX_COLUMNS = 2;
const SKELETON_FACTS = 4;

/**
 * The channel's facts as label/value pairs, in two columns when the width allows (one on narrow
 * phones). The website comes last: a link on phones, plain text on TV (no browser).
 */
export function ChannelFacts({ facts, website, isLoading }: ChannelFactsProps) {
  // Detail spans the screen, so the columns can be worked out from the window width.
  const columns = useColumnCount(
    metrics.detail.factColumnMinWidth,
    MAX_COLUMNS,
    metrics.screen.paddingHorizontal,
  );
  const cellStyle = { width: `${100 / columns}%` } as const;

  if (isLoading) {
    return (
      <SkeletonGroup accessibilityLabel="Loading channel details">
        <View style={styles.grid}>
          {Array.from({ length: SKELETON_FACTS }, (_, index) => (
            <View key={index} style={[styles.fact, cellStyle]}>
              <Skeleton width="40%" height={metrics.type.caption.fontSize} />
              <Skeleton width="70%" height={metrics.type.body.fontSize} />
            </View>
          ))}
        </View>
      </SkeletonGroup>
    );
  }

  return (
    <View style={styles.grid}>
      {facts.map(({ label, value }) => (
        <View key={label} style={[styles.fact, cellStyle]} accessible>
          <Text variant="caption" tone="secondary">
            {label}
          </Text>
          <Text>{value}</Text>
        </View>
      ))}
      {website && (
        // On phones the link is its own screen-reader element, so the cell isn't grouped.
        <View style={[styles.fact, cellStyle]} accessible={device.isTV}>
          <Text variant="caption" tone="secondary">
            Website
          </Text>
          {device.isTV ? (
            <Text>{website}</Text>
          ) : (
            <Text
              accessibilityRole="link"
              style={styles.link}
              onPress={() => void openWebsite(website)}
            >
              {website}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

/** Opens a channel's website in the browser. Only http(s) links, since the URL comes from data. */
async function openWebsite(url: string): Promise<void> {
  if (/^https?:\/\//i.test(url)) await Linking.openURL(url);
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: metrics.spacing.md },
  fact: { gap: metrics.spacing.xs, paddingRight: metrics.spacing.md },
  link: { textDecorationLine: 'underline' },
});
