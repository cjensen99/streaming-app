import { View } from 'react-native';
import { SpatialNavigationNode } from 'react-tv-space-navigation';
import type { FocusGroupProps } from './types';

/**
 * Groups focusable elements (TVs). Always render a group for a section that can change (e.g. a
 * rail that's loading, then loaded): the focus system orders sections by when they first appear.
 */
export function FocusGroup({ direction = 'vertical', style, children, testID }: FocusGroupProps) {
  return (
    <SpatialNavigationNode orientation={direction}>
      <View style={style} testID={testID}>
        {children}
      </View>
    </SpatialNavigationNode>
  );
}
