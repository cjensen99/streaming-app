import { forwardRef } from 'react';
import { Pressable, View } from 'react-native';
import {
  SpatialNavigationNode,
  useSpatialNavigatorFocusableAccessibilityProps,
} from 'react-tv-space-navigation';
import type { FocusableProps, FocusState } from './types';

const UNFOCUSED: FocusState = { focused: false, pressed: false };

/**
 * An element the remote can focus and select (TVs). Focus moves in JavaScript (the focus system),
 * so the same rules apply on tvOS, Android TV and Fire TV. A tap or click (a TV with a pointer)
 * also selects it.
 */
export function Focusable({
  onSelect,
  disabled,
  style,
  children,
  testID,
  ...a11y
}: FocusableProps) {
  // Disabled elements can't take focus: they're left out of the focus system entirely.
  if (disabled) {
    return (
      <View
        accessible
        testID={testID}
        {...a11y}
        accessibilityState={{ ...a11y.accessibilityState, disabled }}
        style={typeof style === 'function' ? style(UNFOCUSED) : style}
      >
        {typeof children === 'function' ? children(UNFOCUSED) : children}
      </View>
    );
  }

  return (
    <SpatialNavigationNode isFocusable onSelect={onSelect}>
      {({ isFocused }) => (
        <FocusTarget
          state={{ focused: isFocused, pressed: false }}
          onSelect={onSelect}
          style={style}
          testID={testID}
          {...a11y}
        >
          {children}
        </FocusTarget>
      )}
    </SpatialNavigationNode>
  );
}

type FocusTargetProps = Omit<FocusableProps, 'disabled'> & { state: FocusState };

/**
 * What a focusable renders. Not natively focusable (`focusable` / `isTVSelectable` off), so the
 * platform's own focus never competes with the focus system; still pressable by touch or pointer.
 * The focus system measures it through its ref to scroll it into view.
 */
const FocusTarget = forwardRef<View, FocusTargetProps>(function FocusTarget(
  { state, onSelect, style, children, accessibilityState, ...props },
  ref,
) {
  // Lets screen readers activate the element the same way the select button does.
  const screenReaderProps = useSpatialNavigatorFocusableAccessibilityProps();
  return (
    <Pressable
      ref={ref}
      {...screenReaderProps}
      {...props}
      accessibilityState={{ ...accessibilityState, selected: state.focused }}
      focusable={false}
      isTVSelectable={false}
      onPress={onSelect}
      style={typeof style === 'function' ? style(state) : style}
    >
      {typeof children === 'function' ? children(state) : children}
    </Pressable>
  );
});
