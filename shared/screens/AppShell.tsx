import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from '../api/QueryProvider';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { NotConnectedState } from '../components/NotConnectedState';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { useAppShell } from '../hooks/useAppShell';
import type { InputAdapter } from '../input/adapters/InputAdapter';
import { InputProvider } from '../input/InputProvider';
import type { InputHandler } from '../input/keys';
import { FocusProvider } from '../focus/FocusProvider';
import { colors } from '../ui/colors';
import { logger } from '../utils/logger';
import { navigationTheme } from './navigationTheme';
import { RootNavigator } from './RootNavigator';

// Keep the native splash screen up until the first screen is worth showing (`useAppShell` hides
// it). This has to happen before the first frame, so it runs as the app starts.
SplashScreen.preventAutoHideAsync().catch((error: unknown) =>
  logger.warn('Could not keep the splash screen up', error),
);

interface AppShellProps {
  /** The platform's input: `remoteAdapter` (TV) or `hardwareBackAdapter` (phones). */
  inputAdapter: InputAdapter;
  /** TVs: the focus system's key handler (`sendKeyToFocus`). Phones have none. */
  focusHandler?: InputHandler;
}

/** The whole app below each platform's `App.tsx`: providers, then `AppContent`. */
export function AppShell({ inputAdapter, focusHandler }: AppShellProps) {
  return (
    <SafeAreaProvider style={styles.root}>
      <QueryProvider>
        <InputProvider adapter={inputAdapter} focusHandler={focusHandler}>
          <AppContent />
        </InputProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

/**
 * The screens, plus the "No internet connection" cover. The navigator stays mounted underneath
 * the cover, so when the connection returns the user is exactly where they were. While covered,
 * it's hidden from screen readers, can't be touched, and (TVs) nothing under it can take focus. (Exported for tests, which provide their
 * own QueryClient and input adapter.)
 */
export function AppContent() {
  const { isOnline } = useAppShell();
  const { navigationRef, onNavigationChange } = useAppNavigation();
  return (
    <View style={styles.root}>
      <View
        style={styles.root}
        accessibilityElementsHidden={!isOnline}
        importantForAccessibility={isOnline ? 'auto' : 'no-hide-descendants'}
      >
        <FocusProvider enabled={isOnline}>
          <ErrorBoundary>
            <NavigationContainer
              ref={navigationRef}
              theme={navigationTheme}
              onReady={onNavigationChange}
              onStateChange={onNavigationChange}
            >
              <RootNavigator />
            </NavigationContainer>
          </ErrorBoundary>
        </FocusProvider>
      </View>
      {!isOnline && (
        <View style={styles.cover}>
          <NotConnectedState testID="not-connected" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // Opaque and on top, so it takes every touch.
  cover: { ...StyleSheet.absoluteFill, backgroundColor: colors.background },
});
