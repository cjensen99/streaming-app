import {
  type ForwardedRef,
  forwardRef,
  type ReactElement,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import { View } from 'react-native';
import {
  SpatialNavigationVirtualizedList,
  type SpatialNavigationVirtualizedListRef,
} from 'react-tv-space-navigation';
import type { FocusRailHandle, FocusRailProps } from './types';

/**
 * A horizontal row of fixed-width items (TVs), virtualised: only the items around the focused
 * one are rendered. Moving into the row focuses the item focused last time, or the first one. The
 * focused item stays at the start of the row; earlier items slide off to the left.
 */
function FocusRailInner<T>(
  { data, renderItem, itemWidth, gap, inset, height, testID }: FocusRailProps<T>,
  ref: ForwardedRef<FocusRailHandle>,
) {
  const listRef = useRef<SpatialNavigationVirtualizedListRef>(null);
  useImperativeHandle(ref, () => ({ focus: (index) => listRef.current?.focus(index) }), []);
  const renderListItem = useCallback(({ item }: { item: T }) => renderItem(item), [renderItem]);

  return (
    <View style={{ height, paddingLeft: inset }} testID={testID}>
      <SpatialNavigationVirtualizedList
        ref={listRef}
        // The list doesn't change the array; its type just isn't readonly.
        data={data as T[]}
        renderItem={renderListItem}
        // Each item gets this much room; the gap is the part its content doesn't fill.
        itemSize={itemWidth + gap}
        orientation="horizontal"
        scrollBehavior="stick-to-start"
      />
    </View>
  );
}

export const FocusRail = forwardRef(FocusRailInner) as <T>(
  props: FocusRailProps<T> & { ref?: ForwardedRef<FocusRailHandle> },
) => ReactElement;
