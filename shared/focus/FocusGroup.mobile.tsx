import { View } from 'react-native';
import type { FocusGroupProps } from './types';

/** Phones have no focus system: just the layout. */
export function FocusGroup({ style, children, testID }: FocusGroupProps) {
  return (
    <View style={style} testID={testID}>
      {children}
    </View>
  );
}
