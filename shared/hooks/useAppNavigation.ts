import {
  type NavigationContainerRefWithCurrent,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import { handleBack } from '../input/backFallback';
import type { RootStackParamList } from '../types/navigation';
import { useInput } from './useInput';

export interface AppNavigationState {
  /** For the navigation container (`ref`), so Back can navigate. */
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>;
  /** For the navigation container's `onReady` and `onStateChange`. */
  onNavigationChange: () => void;
}

/**
 * Connects Back to navigation for the whole app: Back that no layer handled goes back a screen;
 * on the top screen it's left to the platform. Also tells the input adapter, whenever the
 * navigation changes, whether there's a screen to go back to (tvOS hands the Menu button to the
 * system on the top screen).
 */
export function useAppNavigation(): AppNavigationState {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const { dispatcher, adapter } = useInput();
  const canGoBack = useCallback(
    () => navigationRef.isReady() && navigationRef.canGoBack(),
    [navigationRef],
  );

  useEffect(() => {
    dispatcher.setFallback((event) =>
      event.key === 'back'
        ? handleBack({ canGoBack, goBack: () => navigationRef.goBack() })
        : 'pass',
    );
    return () => dispatcher.setFallback(null);
  }, [dispatcher, navigationRef, canGoBack]);

  const onNavigationChange = useCallback(
    () => adapter.setCanGoBack?.(canGoBack()),
    [adapter, canGoBack],
  );

  return { navigationRef, onNavigationChange };
}
