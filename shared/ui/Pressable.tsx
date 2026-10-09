import type { ReactNode } from 'react';
import {
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

/** `focused` is true while a TV remote (or a keyboard) has this element selected. */
export interface PressState {
  pressed: boolean;
  focused: boolean;
}

export interface PressableProps extends Omit<RNPressableProps, 'style' | 'children' | 'onPress'> {
  /** Tap, click, or the remote's select button. */
  onSelect?: () => void;
  style?: StyleProp<ViewStyle> | ((state: PressState) => StyleProp<ViewStyle>);
  children?: ReactNode | ((state: PressState) => ReactNode);
}

// react-native-tvos passes `{ pressed, focused }` to these callbacks, but its type definitions
// still declare only `pressed`.
const withFocus = (state: PressableStateCallbackType) => state as PressState;

/**
 * The one element every selectable thing is built on. Only `Button` and `ContentTile` use it;
 * the TV focus system (Phase 9) replaces what's inside it, so nothing else has to change.
 */
export function Pressable({ onSelect, style, children, ...props }: PressableProps) {
  return (
    <RNPressable
      {...props}
      onPress={onSelect}
      style={typeof style === 'function' ? (state) => style(withFocus(state)) : style}
    >
      {typeof children === 'function' ? (state) => children(withFocus(state)) : children}
    </RNPressable>
  );
}
