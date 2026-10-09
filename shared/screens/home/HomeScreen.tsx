import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContentRail } from '../../components/ContentRail';
import { ErrorState } from '../../components/ErrorState';
import { DefaultFocus } from '../../focus/DefaultFocus';
import { FocusColumn } from '../../focus/FocusColumn';
import { FocusRoot } from '../../focus/FocusRoot';
import { MY_LIST_RAIL } from '../../hooks/useHomeFocus';
import { useHomeScreen } from '../../hooks/useHomeScreen';
import { metrics } from '../../ui/metrics';
import { Text } from '../../ui/Text';
import { CategoryRail } from './CategoryRail';

/**
 * Where a focused tile sits on screen when Home scrolls to it: where the first rail's tiles are,
 * so the first rail never scrolls and every other rail lines up in the same place, title showing.
 */
const RAIL_FOCUS_OFFSET =
  metrics.screen.paddingVertical +
  metrics.type.title.lineHeight +
  metrics.spacing.xl +
  metrics.type.heading.lineHeight +
  metrics.rail.titleGap;

/** The main menu: My List first, then the News, Sports and Movies rails. */
export function HomeScreen() {
  const { focus, myList, rails, allRailsFailed, retryAllRails, openChannel, openMyListChannel } =
    useHomeScreen();
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

  return (
    <FocusRoot active={focus.isActive}>
      {allRailsFailed ? (
        <DefaultFocus>
          <ErrorState
            title="Couldn't load channels"
            message="Check your connection and try again."
            onRetry={retryAllRails}
            testID="home-error"
          />
        </DefaultFocus>
      ) : (
        <FocusColumn focusOffset={RAIL_FOCUS_OFFSET} contentContainerStyle={contentStyle}>
          <Text variant="title" accessibilityRole="header" style={styles.title}>
            StreamShelf
          </Text>
          <DefaultFocus enabled={focus.defaultFocusRail === MY_LIST_RAIL}>
            <ContentRail
              ref={focus.railRef(MY_LIST_RAIL)}
              title="My List"
              items={myList.isLoading ? undefined : myList.items}
              emptyMessage="No channels in My List yet"
              onSelect={openMyListChannel}
              testID="rail-my-list"
            />
          </DefaultFocus>
          {rails.map((homeRail) => (
            <DefaultFocus
              key={homeRail.config.id}
              enabled={focus.defaultFocusRail === homeRail.config.id}
            >
              <CategoryRail
                ref={focus.railRef(homeRail.config.id)}
                homeRail={homeRail}
                onSelect={openChannel}
              />
            </DefaultFocus>
          ))}
        </FocusColumn>
      )}
    </FocusRoot>
  );
}

const styles = StyleSheet.create({
  content: { gap: metrics.spacing.xl },
  title: { paddingHorizontal: metrics.screen.paddingHorizontal },
});
