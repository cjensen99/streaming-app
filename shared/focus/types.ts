import type { ReactElement, ReactNode } from 'react';
import type { AccessibilityProps, StyleProp, ViewStyle } from 'react-native';

/**
 * The focus system's shared interface. Screens and components use only `shared/focus/`; each
 * platform implements these components with the same props: `*.tsx` on TVs
 * (react-tv-space-navigation), `*.mobile.tsx` on phones (plain React Native, no focus system),
 * later `*.web.tsx` for web TVs.
 */

/** `focused`: the remote (or keyboard) has this element selected. `pressed`: touch only. */
export interface FocusState {
  focused: boolean;
  pressed: boolean;
}

export interface FocusableProps extends Pick<
  AccessibilityProps,
  'accessibilityRole' | 'accessibilityLabel' | 'accessibilityHint' | 'accessibilityState'
> {
  /** Tap, click, or the remote's select button. */
  onSelect?: () => void;
  /** Can't be selected, and can't take focus. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle> | ((state: FocusState) => StyleProp<ViewStyle>);
  children?: ReactNode | ((state: FocusState) => ReactNode);
  testID?: string;
}

/** Groups focusable elements: arrows move along `direction` within it before leaving it. */
export interface FocusGroupProps {
  direction?: 'horizontal' | 'vertical';
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  testID?: string;
}

/** Controls a rail from outside (e.g. to focus its first tile). */
export interface FocusRailHandle {
  focus(index: number): void;
}

/** A horizontal, virtualised row of fixed-width items. */
export interface FocusRailProps<T> {
  data: readonly T[];
  renderItem: (item: T) => ReactElement;
  keyExtractor: (item: T) => string;
  /** Every item has this fixed width. */
  itemWidth: number;
  /** Space between items. */
  gap: number;
  /** Space before the first item (the screen's side padding). */
  inset: number;
  /** The row's height. */
  height: number;
  testID?: string;
}

/** The scrolling page a screen's content sits in. */
export interface FocusColumnProps {
  /** When an element takes focus, the page scrolls so it's at least this far from the top. */
  focusOffset?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
  testID?: string;
}

/** One screen's focus area. Only an active root receives keys. */
export interface FocusRootProps {
  /** False while the screen isn't the one showing (e.g. Home under Detail). */
  active: boolean;
  children: ReactNode;
}

/** The app-wide focus setup. `enabled: false` stops every screen taking keys (e.g. offline cover). */
export interface FocusProviderProps {
  enabled: boolean;
  children: ReactNode;
}

/** Elements inside take focus when their screen opens (the first one to appear wins). */
export interface DefaultFocusProps {
  enabled?: boolean;
  children: ReactNode;
}
