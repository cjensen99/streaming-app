import { createContext, useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { SpatialNavigationDeviceTypeProvider } from 'react-tv-space-navigation';
import { useAppState } from '../hooks/useAppState';
import type { FocusProviderProps } from './types';

export interface FocusAppContextValue {
  /** Whether any screen may take keys (false behind the "No internet connection" cover). */
  enabled: boolean;
  /** Gives native focus back to the anchor (see `FocusProvider`). */
  reclaimNativeFocus: () => void;
}

export const FocusAppContext = createContext<FocusAppContextValue>({
  enabled: true,
  reclaimNativeFocus: () => undefined,
});

/**
 * The app-wide focus setup (TVs).
 *
 * Focus moves in JavaScript, so nothing else in the app can take the platform's own (native)
 * focus. But both platforms deliver remote keys through the natively focused view: Android passes
 * key events down the focused views to React Native's root, and tvOS sends Select from the focused
 * view. With nothing natively focused, arrows (Android) and Select (tvOS) would never reach the
 * app. So one invisible view holds native focus for the whole session, and every key press reaches
 * the app's input route. (Back arrives separately, through the activity / Menu handler.)
 *
 * Anything natively focusable added later (a text input, a native modal, player controls) can take
 * native focus away, and the remote would go quiet. So the anchor asks for it back whenever a
 * screen's focus area becomes active (`FocusRoot`) and when the app returns to the foreground.
 */
export function FocusProvider({ enabled, children }: FocusProviderProps) {
  const anchor = useRef<View>(null);
  // Optional call: test environments render a plain View without the TV method.
  const reclaimNativeFocus = useCallback(() => anchor.current?.requestTVFocus?.(), []);

  const appState = useAppState();
  useEffect(() => {
    if (appState === 'active') reclaimNativeFocus();
  }, [appState, reclaimNativeFocus]);

  const value = useMemo(() => ({ enabled, reclaimNativeFocus }), [enabled, reclaimNativeFocus]);
  return (
    <SpatialNavigationDeviceTypeProvider>
      <FocusAppContext.Provider value={value}>
        <View
          ref={anchor}
          style={styles.nativeFocusAnchor}
          focusable
          isTVSelectable
          hasTVPreferredFocus
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          testID="native-focus-anchor"
        />
        {children}
      </FocusAppContext.Provider>
    </SpatialNavigationDeviceTypeProvider>
  );
}

const styles = StyleSheet.create({
  // Invisible (no content, no background) but on screen: platforms skip hidden views for focus.
  nativeFocusAnchor: { position: 'absolute', top: 0, left: 0, width: 1, height: 1 },
});
