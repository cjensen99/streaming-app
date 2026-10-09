import {
  Pressable,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { FocusableProps, FocusState } from './types';

// react-native-tvos passes `{ pressed, focused }` to these callbacks, but its type definitions
// still declare only `pressed`. (`focused` is true with a hardware keyboard.)
const withFocus = (state: PressableStateCallbackType) => state as FocusState;

/** A touchable element (phones). */
export function Focusable({ onSelect, style, children, ...props }: FocusableProps) {
  return (
    <Pressable
      {...props}
      onPress={onSelect}
      style={
        typeof style === 'function'
          ? (state): StyleProp<ViewStyle> => style(withFocus(state))
          : style
      }
    >
      {typeof children === 'function' ? (state) => children(withFocus(state)) : children}
    </Pressable>
  );
}
