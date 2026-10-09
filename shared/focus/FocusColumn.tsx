import { SpatialNavigationScrollView } from 'react-tv-space-navigation';
import { StyleSheet } from 'react-native';
import type { FocusColumnProps } from './types';

/** The scrolling page (TVs): scrolls by itself to keep the focused element in view. */
export function FocusColumn({
  focusOffset = 0,
  contentContainerStyle,
  children,
  testID,
}: FocusColumnProps) {
  return (
    <SpatialNavigationScrollView
      offsetFromStart={focusOffset}
      contentContainerStyle={StyleSheet.flatten(contentContainerStyle)}
      testID={testID}
    >
      {children}
    </SpatialNavigationScrollView>
  );
}
