import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { logger } from '../utils/logger';

/**
 * Hides the native splash screen once `ready` is true. It can't be shown again. (The app keeps
 * it up at startup with `preventAutoHideAsync`, in `app/AppShell.tsx`.)
 */
export function useHideSplashScreen(ready: boolean): void {
  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch((error: unknown) =>
      logger.warn('Could not hide the splash screen', error),
    );
  }, [ready]);
}
