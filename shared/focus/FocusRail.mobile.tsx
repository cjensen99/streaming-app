import {
  type ForwardedRef,
  forwardRef,
  type ReactElement,
  useCallback,
  useImperativeHandle,
} from 'react';
import { FlatList, type ListRenderItem, Platform } from 'react-native';
import type { FocusRailHandle, FocusRailProps } from './types';

/**
 * A horizontal row of fixed-width items (phones): a virtualised FlatList. Items have a fixed
 * width, so positions are computed rather than measured; about a screen of items renders at
 * first and more as the user scrolls.
 */
function FocusRailInner<T>(
  { data, renderItem, keyExtractor, itemWidth, gap, inset, height, testID }: FocusRailProps<T>,
  ref: ForwardedRef<FocusRailHandle>,
) {
  // Phones have no focus system; there's nothing to focus.
  useImperativeHandle(ref, () => ({ focus: () => undefined }), []);
  const renderListItem = useCallback<ListRenderItem<T>>(
    ({ item }) => renderItem(item),
    [renderItem],
  );
  // Offsets include the leading inset, so scrolling to an item lands exactly on it.
  const getItemLayout = useCallback(
    (_: ArrayLike<T> | null | undefined, index: number) => ({
      length: itemWidth,
      offset: inset + (itemWidth + gap) * index,
      index,
    }),
    [itemWidth, gap, inset],
  );

  return (
    <FlatList
      horizontal
      data={data}
      renderItem={renderListItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      initialNumToRender={INITIAL_ITEMS}
      maxToRenderPerBatch={INITIAL_ITEMS}
      // Screens of items kept rendered (default 21): one either side of the visible one.
      windowSize={3}
      // Detaching off-screen items saves memory on Android; on iOS it can blank rows.
      removeClippedSubviews={Platform.OS === 'android'}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: inset, gap }}
      style={{ height }}
      testID={testID}
    />
  );
}

/** About a phone screen of tiles. */
const INITIAL_ITEMS = 4;

export const FocusRail = forwardRef(FocusRailInner) as <T>(
  props: FocusRailProps<T> & { ref?: ForwardedRef<FocusRailHandle> },
) => ReactElement;
